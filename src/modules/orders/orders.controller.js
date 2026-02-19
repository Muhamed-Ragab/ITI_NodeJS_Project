import { StatusCodes } from "http-status-codes";
import { ApiError } from "../../utils/errors/api-error.js";
import { sendSuccess } from "../../utils/response.js";
import * as service from "./orders.service.js";

export const createOrder = async (req, res, next) => {
	try {
		const userId = req.user.id;
		const options = {};
		if (req.body?.shippingAddressIndex !== undefined) {
			options.shippingAddressIndex = req.body.shippingAddressIndex;
		}
		const order = await service.createOrderFromCart(userId, options);
		return sendSuccess(res, {
			statusCode: StatusCodes.CREATED,
			data: order,
			message: "Order created successfully",
		});
	} catch (error) {
		next(
			error instanceof ApiError
				? error
				: ApiError.internal({
						code: "ORDER.CREATE_FAILED",
						message: "Failed to create order",
						details: { message: error.message },
					})
		);
	}
};

export const getOrderById = async (req, res, next) => {
	try {
		const orderId = req.params.id;
		const userId = req.user.id;
		const userRole = req.user.role;
		const order = await service.getOrderById(orderId, userId, userRole);
		return sendSuccess(res, {
			statusCode: StatusCodes.OK,
			data: order,
			message: "Order retrieved successfully",
		});
	} catch (error) {
		next(
			error instanceof ApiError
				? error
				: ApiError.internal({ details: { message: error.message } })
		);
	}
};

export const listMyOrders = async (req, res, next) => {
	try {
		const userId = req.user.id;
		const orders = await service.listOrdersByUser(userId);
		return sendSuccess(res, {
			statusCode: StatusCodes.OK,
			data: orders,
			message: "Orders retrieved successfully",
		});
	} catch (error) {
		next(
			error instanceof ApiError
				? error
				: ApiError.internal({ details: { message: error.message } })
		);
	}
};

export const updateOrderStatus = async (req, res, next) => {
	try {
		const orderId = req.params.id;
		const { status } = req.body;
		const userRole = req.user.role;
		const order = await service.updateStatus(orderId, status, userRole);
		return sendSuccess(res, {
			statusCode: StatusCodes.OK,
			data: order,
			message: "Order status updated successfully",
		});
	} catch (error) {
		next(
			error instanceof ApiError
				? error
				: ApiError.internal({ details: { message: error.message } })
		);
	}
};

export const listAllOrders = async (req, res, next) => {
	try {
		const page = Math.max(1, Number(req.query.page) || 1);
		const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
		const skip = (page - 1) * limit;
		const orders = await service.listOrdersAll(skip, limit);
		return sendSuccess(res, {
			statusCode: StatusCodes.OK,
			data: orders,
			message: "Orders retrieved successfully",
		});
	} catch (error) {
		next(
			error instanceof ApiError
				? error
				: ApiError.internal({ details: { message: error.message } })
		);
	}
};
