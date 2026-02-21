import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";
import { sendOrderStatusNotification } from "../../services/notifications/order-notifications.js";
import { ApiError } from "../../utils/errors/api-error.js";
import { logDevError } from "../../utils/logger.js";
import * as couponsService from "../coupons/coupons.service.js";
import ProductModel from "../products/products.model.js";
import * as usersRepo from "../users/users.repository.js";
import * as ordersRepo from "./orders.repository.js";

const ORDER_STATUSES = ["pending", "paid", "shipped", "delivered", "cancelled"];
const PAYMENT_METHODS = ["stripe", "paypal", "cod", "wallet"];

const normalizePaymentMethod = (value) => {
	if (typeof value !== "string") {
		return "stripe";
	}

	const normalized = value.trim().toLowerCase();
	if (PAYMENT_METHODS.includes(normalized)) {
		return normalized;
	}

	throw ApiError.badRequest({
		code: "ORDER.INVALID_PAYMENT_METHOD",
		message: "Invalid payment method",
		details: { allowed: PAYMENT_METHODS },
	});
};

const buildPriceSnapshot = (
	subtotalAmount,
	discountAmount = 0,
	couponInfo = null
) => {
	const shippingAmount = 0;
	const taxAmount = 0;
	const totalAmount =
		subtotalAmount - discountAmount + shippingAmount + taxAmount;

	return {
		subtotal_amount: subtotalAmount,
		discount_amount: discountAmount,
		shipping_amount: shippingAmount,
		tax_amount: taxAmount,
		total_amount: totalAmount,
		coupon_info: couponInfo,
	};
};

const validateAndFetchCartItems = async (cart) => {
	if (!cart || cart.length === 0) {
		throw ApiError.badRequest({
			code: "ORDER.CART_EMPTY",
			message: "Cart is empty",
		});
	}

	const productIds = cart.map((entry) => entry.product);

	const products = await ProductModel.find({
		_id: { $in: productIds },
	}).select("_id seller_id title price stock_quantity");

	const productMap = new Map();
	for (const product of products) {
		productMap.set(String(product._id), product);
	}

	const validatedItems = [];
	let totalAmount = 0;

	for (const entry of cart) {
		const productId = entry.product;
		const quantity = entry.quantity ?? 1;
		const product = productMap.get(String(productId));

		if (!product) {
			throw ApiError.notFound({
				code: "ORDER.PRODUCT_NOT_FOUND",
				message: `Product ${productId} not found`,
				details: { productId: String(productId) },
			});
		}

		const stock = product.stock_quantity ?? 0;
		if (stock < quantity) {
			throw new ApiError({
				statusCode: StatusCodes.CONFLICT,
				code: "ORDER.STOCK_CONFLICT",
				message: `Insufficient stock for product: ${product.title ?? productId}`,
				details: {
					productId: String(productId),
					requested: quantity,
					available: stock,
				},
			});
		}

		const price = Number(product.price) ?? 0;
		validatedItems.push({
			product: product._id,
			seller_id: product.seller_id,
			title: product.title ?? "",
			price,
			quantity,
		});
		totalAmount += price * quantity;
	}

	return { items: validatedItems, totalAmount };
};

export const createOrderFromCart = async (userId, options = {}) => {
	const session = await mongoose.startSession();

	try {
		return await session.withTransaction(
			async () => {
				const user = await usersRepo.findById(userId);
				if (!user) {
					throw ApiError.notFound({
						code: "USER.NOT_FOUND",
						message: "User not found",
					});
				}

				const { items, totalAmount } = await validateAndFetchCartItems(
					user.cart || []
				);

				let discountAmount = 0;
				let couponInfo = null;
				let couponId = null;
				if (options.couponCode) {
					const couponValidation = await couponsService.validateCouponForOrder({
						code: options.couponCode,
						userId,
						subtotalAmount: totalAmount,
					});
					discountAmount = couponValidation.discountAmount;
					couponInfo = couponValidation.couponInfo;
					couponId = couponValidation.coupon._id;
				}

				const pricingSnapshot = buildPriceSnapshot(
					totalAmount,
					discountAmount,
					couponInfo
				);

				const shippingAddressIndex = options.shippingAddressIndex ?? 0;
				const addresses = user.addresses || [];
				const shipping_address = addresses[shippingAddressIndex]
					? {
							street: addresses[shippingAddressIndex].street,
							city: addresses[shippingAddressIndex].city,
							country: addresses[shippingAddressIndex].country,
							zip: addresses[shippingAddressIndex].zip,
						}
					: undefined;

				const order = await ordersRepo.create({
					user: userId,
					...pricingSnapshot,
					status: "pending",
					payment_info: {
						method: normalizePaymentMethod(options.paymentMethod),
						status: "pending",
						stripe_payment_intent_id: null,
					},
					status_timeline: [
						{
							status: "pending",
							changed_at: new Date(),
							source: "system",
							note: "Order placed",
						},
					],
					shipping_address,
					items,
				});

				if (couponId) {
					await couponsService.consumeCouponUsage(couponId, userId);
				}

				await usersRepo.updateById(userId, { cart: [] });

				try {
					await sendOrderStatusNotification({
						orderId: String(order._id),
						status: "pending",
						email: user.email,
						name: user.name,
					});
				} catch (error) {
					logDevError({
						scope: "orders.notifications.pending",
						message: "Failed to send order placed notification",
						error,
						meta: { orderId: String(order._id), userId: String(userId) },
					});
				}

				return order;
			},
			{ session }
		);
	} finally {
		await session.endSession();
	}
};

export const getOrderById = async (orderId, userId, userRole) => {
	const order = await ordersRepo.findById(orderId);
	if (!order) {
		throw ApiError.notFound({
			code: "ORDER.NOT_FOUND",
			message: "Order not found",
			details: { orderId: String(orderId) },
		});
	}

	const isOwner = String(order.user) === String(userId);
	const isAdmin = userRole === "admin";
	const isSeller =
		userRole === "seller" &&
		Array.isArray(order.items) &&
		order.items.some((item) => String(item.seller_id) === String(userId));

	if (!(isOwner || isAdmin || isSeller)) {
		throw ApiError.forbidden({
			code: "ORDER.FORBIDDEN",
			message: "You are not allowed to access this order",
		});
	}

	return order;
};

export const createGuestOrder = async ({
	guest_info,
	shipping_address,
	items,
	couponCode,
	paymentMethod,
}) => {
	const normalizedItems = (items || []).map((item) => ({
		product: item.product,
		quantity: item.quantity,
	}));

	const { items: validatedItems, totalAmount } =
		await validateAndFetchCartItems(normalizedItems);

	let discountAmount = 0;
	let couponInfo = null;
	if (couponCode) {
		const couponValidation = await couponsService.validateCouponForOrder({
			code: couponCode,
			userId: guest_info.email,
			subtotalAmount: totalAmount,
		});

		discountAmount = couponValidation.discountAmount;
		couponInfo = couponValidation.couponInfo;
	}

	const pricingSnapshot = buildPriceSnapshot(
		totalAmount,
		discountAmount,
		couponInfo
	);

	const order = await ordersRepo.create({
		user: null,
		guest_info,
		shipping_address,
		items: validatedItems,
		...pricingSnapshot,
		status: "pending",
		payment_info: {
			method: normalizePaymentMethod(paymentMethod),
			status: "pending",
			stripe_payment_intent_id: null,
		},
		status_timeline: [
			{
				status: "pending",
				changed_at: new Date(),
				source: "system",
				note: "Guest order placed",
			},
		],
	});

	if (guest_info?.email) {
		try {
			await sendOrderStatusNotification({
				orderId: String(order._id),
				status: "pending",
				email: guest_info.email,
				name: guest_info.name,
			});
		} catch (error) {
			logDevError({
				scope: "orders.notifications.guest.pending",
				message: "Failed to send guest order notification",
				error,
				meta: { orderId: String(order._id) },
			});
		}
	}

	return order;
};

export const listOrdersByUser = async (userId) => {
	return await ordersRepo.findByUser(userId);
};

export const listOrdersBySeller = async (sellerId) => {
	return await ordersRepo.findBySeller(sellerId);
};

export const updateStatus = async (orderId, status, _userRole) => {
	const order = await ordersRepo.findById(orderId);
	if (!order) {
		throw ApiError.notFound({
			code: "ORDER.NOT_FOUND",
			message: "Order not found",
			details: { orderId: String(orderId) },
		});
	}

	if (!ORDER_STATUSES.includes(status)) {
		throw ApiError.badRequest({
			code: "ORDER.INVALID_STATUS",
			message: "Invalid status",
			details: { status, allowed: ORDER_STATUSES },
		});
	}

	const updatedOrder = await ordersRepo.updateStatusById(orderId, status);

	const orderOwner = await usersRepo.findById(updatedOrder.user);
	if (orderOwner?.email) {
		try {
			await sendOrderStatusNotification({
				orderId: String(updatedOrder._id),
				status,
				email: orderOwner.email,
				name: orderOwner.name,
			});
		} catch (error) {
			logDevError({
				scope: "orders.notifications.status",
				message: "Failed to send order status notification",
				error,
				meta: { orderId: String(orderId), status },
			});
		}
	}

	return updatedOrder;
};

export const updateStatusBySeller = async (orderId, status, sellerId) => {
	const order = await ordersRepo.findById(orderId);
	if (!order) {
		throw ApiError.notFound({
			code: "ORDER.NOT_FOUND",
			message: "Order not found",
			details: { orderId: String(orderId) },
		});
	}

	if (
		!(status === "shipped" || status === "delivered" || status === "cancelled")
	) {
		throw ApiError.badRequest({
			code: "ORDER.INVALID_STATUS",
			message: "Invalid status for seller update",
			details: { allowed: ["shipped", "delivered", "cancelled"] },
		});
	}

	const canManageOrder =
		Array.isArray(order.items) &&
		order.items.some((item) => String(item.seller_id) === String(sellerId));

	if (!canManageOrder) {
		throw ApiError.forbidden({
			code: "ORDER.FORBIDDEN",
			message: "You are not allowed to update this order",
		});
	}

	const updatedOrder = await ordersRepo.updateStatusById(
		orderId,
		status,
		"seller"
	);

	if (order.user) {
		const orderOwner = await usersRepo.findById(order.user);
		if (orderOwner?.email) {
			try {
				await sendOrderStatusNotification({
					orderId: String(updatedOrder._id),
					status,
					email: orderOwner.email,
					name: orderOwner.name,
				});
			} catch (error) {
				logDevError({
					scope: "orders.notifications.seller-status",
					message: "Failed to send order status notification",
					error,
					meta: { orderId: String(orderId), status },
				});
			}
		}
	}

	if (order.guest_info?.email) {
		try {
			await sendOrderStatusNotification({
				orderId: String(updatedOrder._id),
				status,
				email: order.guest_info.email,
				name: order.guest_info.name,
			});
		} catch (error) {
			logDevError({
				scope: "orders.notifications.guest-seller-status",
				message: "Failed to send guest order status notification",
				error,
				meta: { orderId: String(orderId), status },
			});
		}
	}

	return updatedOrder;
};

export const listOrdersAll = async (skip = 0, limit = 20) => {
	return await ordersRepo.listAll(skip, limit);
};
