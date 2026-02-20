import { StatusCodes } from "http-status-codes";
import { parsePagination } from "../../utils/pagination.js";
import { sendSuccess } from "../../utils/response.js";
import * as service from "./orders.service.js";

export const createOrder = async (req, res) => {
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
};

export const getOrderById = async (req, res) => {
	const orderId = req.params.id;
	const userId = req.user.id;
	const userRole = req.user.role;
	const order = await service.getOrderById(orderId, userId, userRole);
	return sendSuccess(res, {
		statusCode: StatusCodes.OK,
		data: order,
		message: "Order retrieved successfully",
	});
};

export const listMyOrders = async (req, res) => {
	const userId = req.user.id;
	const orders = await service.listOrdersByUser(userId);
	return sendSuccess(res, {
		statusCode: StatusCodes.OK,
		data: orders,
		message: "Orders retrieved successfully",
	});
};

export const updateOrderStatus = async (req, res) => {
	const orderId = req.params.id;
	const { status } = req.body;
	const userRole = req.user.role;
	const order = await service.updateStatus(orderId, status, userRole);
	return sendSuccess(res, {
		statusCode: StatusCodes.OK,
		data: order,
		message: "Order status updated successfully",
	});
};

export const listAllOrders = async (req, res) => {
	const { skip, limit } = parsePagination(req.query);
	const orders = await service.listOrdersAll(skip, limit);
	return sendSuccess(res, {
		statusCode: StatusCodes.OK,
		data: orders,
		message: "Orders retrieved successfully",
	});
};
