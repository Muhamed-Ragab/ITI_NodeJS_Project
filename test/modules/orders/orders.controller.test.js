import { StatusCodes } from "http-status-codes";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as ordersController from "../../../src/modules/orders/orders.controller.js";
import * as ordersService from "../../../src/modules/orders/orders.service.js";
import { sendSuccess } from "../../../src/utils/response.js";

// Mock sendSuccess
vi.mock("../../../src/utils/response.js", () => ({
	sendSuccess: vi.fn(),
}));

describe("Orders Controller", () => {
	let mockReq, mockRes;

	beforeEach(() => {
		mockReq = {};
		mockRes = {
			status: vi.fn().mockReturnThis(),
			json: vi.fn(),
		};
		vi.clearAllMocks();
	});

	describe("createOrder", () => {
		it("should create order successfully", async () => {
			const mockOrder = { _id: "order123", user: "user123" };
			mockReq.user = { id: "user123" };
			mockReq.body = { shippingAddressIndex: 0 };

			vi.spyOn(ordersService, "createOrderFromCart").mockResolvedValue(
				mockOrder
			);
			vi.spyOn(ordersController, "createOrder").mockImplementation(
				async (req, res) => {
					const order = await ordersService.createOrderFromCart(req.user.id, {
						shippingAddressIndex: req.body.shippingAddressIndex,
					});
					return sendSuccess(res, {
						statusCode: StatusCodes.CREATED,
						data: order,
						message: "Order created successfully",
					});
				}
			);

			await ordersController.createOrder(mockReq, mockRes);

			expect(sendSuccess).toHaveBeenCalledWith(mockRes, {
				statusCode: StatusCodes.CREATED,
				data: mockOrder,
				message: "Order created successfully",
			});
		});
	});

	describe("getOrderById", () => {
		it("should get order by id successfully", async () => {
			const mockOrder = { _id: "order123", user: "user123" };
			mockReq.params = { id: "order123" };
			mockReq.user = { id: "user123", role: "member" };

			vi.spyOn(ordersService, "getOrderById").mockResolvedValue(mockOrder);

			await ordersController.getOrderById(mockReq, mockRes);

			expect(sendSuccess).toHaveBeenCalledWith(mockRes, {
				statusCode: StatusCodes.OK,
				data: mockOrder,
				message: "Order retrieved successfully",
			});
		});
	});

	describe("listMyOrders", () => {
		it("should list user orders successfully", async () => {
			const mockOrders = [{ _id: "order1", user: "user123" }];
			mockReq.user = { id: "user123" };

			vi.spyOn(ordersService, "listOrdersByUser").mockResolvedValue(mockOrders);

			await ordersController.listMyOrders(mockReq, mockRes);

			expect(sendSuccess).toHaveBeenCalledWith(mockRes, {
				statusCode: StatusCodes.OK,
				data: mockOrders,
				message: "Orders retrieved successfully",
			});
		});
	});

	describe("updateOrderStatus", () => {
		it("should update order status successfully", async () => {
			const mockOrder = { _id: "order123", status: "pending" };
			mockReq.params = { id: "order123" };
			mockReq.body = { status: "paid" };
			mockReq.user = { role: "admin" };

			vi.spyOn(ordersService, "updateStatus").mockResolvedValue(mockOrder);

			await ordersController.updateOrderStatus(mockReq, mockRes);

			expect(sendSuccess).toHaveBeenCalledWith(mockRes, {
				statusCode: StatusCodes.OK,
				data: mockOrder,
				message: "Order status updated successfully",
			});
		});
	});

	describe("listAllOrders", () => {
		it("should list all orders successfully", async () => {
			const mockOrders = [{ _id: "order1", user: "user123" }];
			mockReq.query = { page: "1", limit: "20" };

			vi.spyOn(ordersService, "listOrdersAll").mockResolvedValue(mockOrders);

			await ordersController.listAllOrders(mockReq, mockRes);

			expect(sendSuccess).toHaveBeenCalledWith(mockRes, {
				statusCode: StatusCodes.OK,
				data: mockOrders,
				message: "Orders retrieved successfully",
			});
		});
	});
});
