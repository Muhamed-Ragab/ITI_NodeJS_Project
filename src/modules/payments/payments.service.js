import Stripe from "stripe";
import { env } from "../../config/env.js";
import { sendOrderStatusNotification } from "../../services/notifications/order-notifications.js";
import { ApiError } from "../../utils/errors/api-error.js";
import { logDevError } from "../../utils/logger.js";
import * as usersRepo from "../users/users.repository.js";
import * as paymentsRepo from "./payments.repository.js";

let stripeClient = null;

const PAYMENT_METHODS = ["stripe", "paypal", "cod", "wallet"];

const normalizeMethod = (method) => {
	if (typeof method !== "string") {
		throw ApiError.badRequest({
			code: "PAYMENT.INVALID_METHOD",
			message: "Invalid payment method",
			details: { allowed: PAYMENT_METHODS },
		});
	}

	const normalized = method.trim().toLowerCase();
	if (!PAYMENT_METHODS.includes(normalized)) {
		throw ApiError.badRequest({
			code: "PAYMENT.INVALID_METHOD",
			message: "Invalid payment method",
			details: { allowed: PAYMENT_METHODS },
		});
	}

	return normalized;
};

function getStripeClient() {
	if (!stripeClient) {
		const stripeSecretKey =
			env?.STRIPE_SECRET_KEY ?? process.env.STRIPE_SECRET_KEY;
		if (!stripeSecretKey) {
			throw ApiError.internal({
				code: "PAYMENT.STRIPE_NOT_CONFIGURED",
				message: "Stripe secret key is not configured",
			});
		}
		stripeClient = new Stripe(stripeSecretKey, {
			apiVersion: "2024-12-18.acacia",
		});
	}
	return stripeClient;
}

export const createPaymentIntent = async (orderId, userId) => {
	const order = await paymentsRepo.findOrderById(orderId);
	if (!order) {
		throw ApiError.notFound({
			code: "ORDER.NOT_FOUND",
			message: "Order not found",
			details: { orderId: String(orderId) },
		});
	}

	const isOwner = String(order.user) === String(userId);
	if (!isOwner) {
		throw ApiError.forbidden({
			code: "ORDER.FORBIDDEN",
			message: "You are not allowed to create payment for this order",
		});
	}

	if (order.status !== "pending") {
		throw ApiError.badRequest({
			code: "ORDER.INVALID_STATUS",
			message: "Order is not in pending status",
			details: { currentStatus: order.status },
		});
	}

	const stripe = getStripeClient();
	const amountInCents = Math.round(order.total_amount * 100);

	try {
		const paymentIntent = await stripe.paymentIntents.create({
			amount: amountInCents,
			currency: "usd",
			metadata: {
				orderId: String(orderId),
				userId: String(userId),
			},
		});

		await paymentsRepo.updateOrderPaymentStatus(orderId, {
			payment_info: {
				stripe_payment_intent_id: paymentIntent.id,
				status: paymentIntent.status,
				method: null,
			},
		});

		return {
			clientSecret: paymentIntent.client_secret,
			paymentIntentId: paymentIntent.id,
		};
	} catch (error) {
		throw ApiError.internal({
			code: "PAYMENT.STRIPE_ERROR",
			message: "Failed to create payment intent",
			details: {
				message: error.message,
				type: error.type,
			},
		});
	}
};

export const handleStripeWebhook = async (stripeSignature, rawBody) => {
	const stripe = getStripeClient();
	const webhookSecret =
		env?.STRIPE_WEBHOOK_SECRET ?? process.env.STRIPE_WEBHOOK_SECRET;

	if (!webhookSecret) {
		throw ApiError.internal({
			code: "PAYMENT.WEBHOOK_SECRET_NOT_CONFIGURED",
			message: "Stripe webhook secret is not configured",
		});
	}

	let event;
	try {
		event = stripe.webhooks.constructEvent(
			rawBody,
			stripeSignature,
			webhookSecret
		);
	} catch (error) {
		throw ApiError.badRequest({
			code: "PAYMENT.INVALID_SIGNATURE",
			message: "Invalid webhook signature",
			details: { message: error.message },
		});
	}

	const paymentIntent = event.data.object;
	const eventType = event.type;

	if (eventType === "payment_intent.succeeded") {
		const orderId = paymentIntent.metadata?.orderId;
		if (!orderId) {
			throw ApiError.badRequest({
				code: "PAYMENT.MISSING_ORDER_ID",
				message: "Order ID not found in payment intent metadata",
			});
		}

		const currentOrder = await paymentsRepo.findOrderById(orderId);
		if (currentOrder?.status === "paid") {
			return { received: true, alreadyProcessed: true };
		}

		await paymentsRepo.updateOrderPaymentStatus(orderId, {
			status: "paid",
			payment_info: {
				stripe_payment_intent_id: paymentIntent.id,
				status: paymentIntent.status,
				method: paymentIntent.payment_method_types?.[0] || null,
			},
		});

		const orderOwner = await usersRepo.findById(currentOrder.user);
		if (orderOwner?.email) {
			try {
				await sendOrderStatusNotification({
					orderId: String(orderId),
					status: "paid",
					email: orderOwner.email,
					name: orderOwner.name,
				});
			} catch (error) {
				logDevError({
					scope: "payments.notifications.paid",
					message: "Failed to send paid notification",
					error,
					meta: { orderId: String(orderId) },
				});
			}
		}
	} else if (eventType === "payment_intent.payment_failed") {
		const orderId = paymentIntent.metadata?.orderId;
		if (orderId) {
			await paymentsRepo.updateOrderPaymentStatus(orderId, {
				payment_info: {
					stripe_payment_intent_id: paymentIntent.id,
					status: paymentIntent.status,
					method: null,
				},
			});
		}
	}

	return { received: true };
};

export const listPaymentsForAdmin = async (filters = {}) => {
	return await paymentsRepo.listPaymentsForAdmin(filters);
};

export const processCheckoutPayment = async (
	orderId,
	userId,
	method,
	savedMethodId
) => {
	const order = await paymentsRepo.findOrderById(orderId);
	if (!order) {
		throw ApiError.notFound({
			code: "ORDER.NOT_FOUND",
			message: "Order not found",
			details: { orderId: String(orderId) },
		});
	}

	const isOwner = String(order.user) === String(userId);
	if (!isOwner) {
		throw ApiError.forbidden({
			code: "ORDER.FORBIDDEN",
			message: "You are not allowed to pay this order",
		});
	}

	if (order.status !== "pending") {
		throw ApiError.badRequest({
			code: "ORDER.INVALID_STATUS",
			message: "Only pending orders can be paid",
			details: { currentStatus: order.status },
		});
	}

	const normalizedMethod = normalizeMethod(method);

	if (normalizedMethod === "stripe") {
		return await createPaymentIntent(orderId, userId);
	}

	if (normalizedMethod === "wallet") {
		const user = await usersRepo.findById(userId);
		const walletBalance = Number(user?.wallet_balance ?? 0);
		if (walletBalance < Number(order.total_amount)) {
			throw ApiError.badRequest({
				code: "PAYMENT.INSUFFICIENT_WALLET_BALANCE",
				message: "Insufficient wallet balance",
				details: {
					walletBalance,
					required: Number(order.total_amount),
				},
			});
		}

		const nextBalance = walletBalance - Number(order.total_amount);
		await usersRepo.updateById(userId, { wallet_balance: nextBalance });

		await paymentsRepo.updateOrderPaymentStatus(orderId, {
			status: "paid",
			payment_info: {
				method: "wallet",
				status: "succeeded",
				stripe_payment_intent_id: savedMethodId
					? `wallet:${savedMethodId}`
					: null,
			},
		});

		const orderOwner = await usersRepo.findById(order.user);
		if (orderOwner?.email) {
			try {
				await sendOrderStatusNotification({
					orderId: String(orderId),
					status: "paid",
					email: orderOwner.email,
					name: orderOwner.name,
				});
			} catch (error) {
				logDevError({
					scope: "payments.notifications.wallet",
					message: "Failed to send wallet paid notification",
					error,
					meta: { orderId: String(orderId) },
				});
			}
		}

		return {
			method: "wallet",
			status: "paid",
			message: "Order paid successfully using wallet",
		};
	}

	if (normalizedMethod === "cod") {
		await paymentsRepo.updateOrderPaymentStatus(orderId, {
			payment_info: {
				method: "cod",
				status: "pending_cod",
				stripe_payment_intent_id: null,
			},
		});

		return {
			method: "cod",
			status: "pending",
			message: "Cash on delivery selected",
		};
	}

	if (normalizedMethod === "paypal") {
		await paymentsRepo.updateOrderPaymentStatus(orderId, {
			payment_info: {
				method: "paypal",
				status: "pending",
				stripe_payment_intent_id: null,
			},
		});

		return {
			method: "paypal",
			status: "pending",
			message: "PayPal payment initiated",
		};
	}

	throw ApiError.badRequest({
		code: "PAYMENT.INVALID_METHOD",
		message: "Invalid payment method",
		details: { allowed: PAYMENT_METHODS },
	});
};
