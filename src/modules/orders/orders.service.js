import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";
import { ApiError } from "../../utils/errors/api-error.js";
import ProductModel from "../products/products.model.js";
import * as usersRepo from "../users/users.repository.js";
import * as ordersRepo from "./orders.repository.js";

const ORDER_STATUSES = ["pending", "paid", "shipped", "delivered", "cancelled"];

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
	}).select("_id title price stock_quantity");

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
					total_amount: totalAmount,
					status: "pending",
					shipping_address,
					items,
				});

				await usersRepo.updateById(userId, { cart: [] });

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
	if (!(isOwner || isAdmin)) {
		throw ApiError.forbidden({
			code: "ORDER.FORBIDDEN",
			message: "You are not allowed to access this order",
		});
	}

	return order;
};

export const listOrdersByUser = async (userId) => {
	return await ordersRepo.findByUser(userId);
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

	return await ordersRepo.updateStatusById(orderId, status);
};

export const listOrdersAll = async (skip = 0, limit = 20) => {
	return await ordersRepo.listAll(skip, limit);
};
