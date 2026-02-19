import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";
import { ApiError } from "../../utils/errors/api-error.js";
import * as usersRepo from "../users/users.repository.js";
import * as ordersRepo from "./orders.repository.js";

const ORDER_STATUSES = ["pending", "paid", "shipped", "delivered", "cancelled"];

/**
 * Resolve Product model. Throws if not registered (products module must be loaded first).
 */
function getProductModel() {
	const Product = mongoose.models.Product;
	if (!Product) {
		throw ApiError.internal({
			code: "ORDER.PRODUCT_MODEL_REQUIRED",
			message:
				"Product model is not registered. Load the products module first.",
		});
	}
	return Product;
}

/**
 * Create order from the authenticated user's cart.
 * Validates cart not empty, product existence, and stock; then creates order and clears cart.
 */
export const createOrderFromCart = async (userId, options = {}) => {
	const user = await usersRepo.findById(userId);
	if (!user) {
		throw ApiError.notFound({
			code: "USER.NOT_FOUND",
			message: "User not found",
		});
	}

	const cart = user.cart || [];
	if (cart.length === 0) {
		throw ApiError.badRequest({
			code: "ORDER.CART_EMPTY",
			message: "Cart is empty",
		});
	}

	const Product = getProductModel();
	const items = [];
	let total_amount = 0;

	for (const entry of cart) {
		const productId = entry.product;
		const quantity = entry.quantity ?? 1;

		const product = await Product.findById(productId);
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
		items.push({
			product: product._id,
			title: product.title ?? "",
			price,
			quantity,
		});
		total_amount += price * quantity;
	}

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
		total_amount,
		status: "pending",
		shipping_address,
		items,
	});

	await usersRepo.updateById(userId, { cart: [] });

	return order;
};

/**
 * Get order by id. Allowed only for order owner or admin.
 */
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
	if (!(isOwner || isAdmin)) {
		throw ApiError.forbidden({
			code: "ORDER.FORBIDDEN",
			message: "You are not allowed to access this order",
		});
	}

	return order;
};

/**
 * List orders for the given user.
 */
export const listOrdersByUser = async (userId) => {
	return await ordersRepo.findByUser(userId);
};

/**
 * Update order status. Allowed for admin only (docs also mention seller; user schema has member|admin).
 */
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

	return await ordersRepo.updateStatusById(orderId, status);
};

/**
 * List all orders (admin only). Supports skip/limit pagination.
 */
export const listOrdersAll = async (skip = 0, limit = 20) => {
	return await ordersRepo.listAll(skip, limit);
};
