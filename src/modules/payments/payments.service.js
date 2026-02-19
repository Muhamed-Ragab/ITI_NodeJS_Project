import Stripe from "stripe";
import { env } from "../../config/env.js";
import { ApiError } from "../../utils/errors/api-error.js";
import * as paymentsRepo from "./payments.repository.js";

let stripeClient = null;

/**
 * Get or initialize Stripe client.
 */
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

/**
 * Create payment intent for an order.
 * Verifies order ownership and status, then creates Stripe payment intent.
 */
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

/**
 * Handle Stripe webhook event.
 * Verifies signature and processes payment events to update order status.
 */
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

	if (event.type === "payment_intent.succeeded") {
		const orderId = paymentIntent.metadata?.orderId;
		if (!orderId) {
			throw ApiError.badRequest({
				code: "PAYMENT.MISSING_ORDER_ID",
				message: "Order ID not found in payment intent metadata",
			});
		}

		await paymentsRepo.updateOrderPaymentStatus(orderId, {
			status: "paid",
			payment_info: {
				stripe_payment_intent_id: paymentIntent.id,
				status: paymentIntent.status,
				method: paymentIntent.payment_method_types?.[0] || null,
			},
		});
	} else if (event.type === "payment_intent.payment_failed") {
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
