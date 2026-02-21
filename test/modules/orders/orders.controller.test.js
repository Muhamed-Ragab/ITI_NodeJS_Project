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

			await ordersController.createOrder(mockReq, mockRes);

			expect(sendSuccess).toHaveBeenCalledWith(mockRes, {
				statusCode: StatusCodes.CREATED,
				data: mockOrder,
				message: "Order created successfully",
			});
		});

		it("should pass payment method to service", async () => {
			const mockOrder = { _id: "order456", user: "user123" };
			mockReq.user = { id: "user123" };
			mockReq.body = { paymentMethod: "wallet" };

			vi.spyOn(ordersService, "createOrderFromCart").mockResolvedValue(
				mockOrder
			);

			await ordersController.createOrder(mockReq, mockRes);

			expect(ordersService.createOrderFromCart).toHaveBeenCalledWith(
				"user123",
				{
					paymentMethod: "wallet",
				}
			);
		});
	});

	describe("createGuestOrder", () => {
		it("should create guest order successfully", async () => {
			const mockOrder = { _id: "guest-order-1", user: null };
			mockReq.body = {
				guest_info: { name: "Guest", email: "guest@test.com" },
				items: [{ product: "product1", quantity: 1 }],
			};

			vi.spyOn(ordersService, "createGuestOrder").mockResolvedValue(mockOrder);

			await ordersController.createGuestOrder(mockReq, mockRes);

			expect(ordersService.createGuestOrder).toHaveBeenCalledWith(mockReq.body);
			expect(sendSuccess).toHaveBeenCalledWith(mockRes, {
				statusCode: StatusCodes.CREATED,
				data: mockOrder,
				message: "Guest order created successfully",
			});
		});
	});

	describe("getOrderById", () => {
		it("should get order by id successfully", async () => {
			const mockOrder = { _id: "order123", user: "user123" };
			mockReq.params = { id: "order123" };
			mockReq.user = { id: "user123", role: "customer" };

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

	describe("listSellerOrders", () => {
		it("should list seller orders successfully", async () => {
			const mockOrders = [{ _id: "order1" }];
			mockReq.user = { id: "seller-1", role: "seller" };

			vi.spyOn(ordersService, "listOrdersBySeller").mockResolvedValue(
				mockOrders
			);

			await ordersController.listSellerOrders(mockReq, mockRes);

			expect(ordersService.listOrdersBySeller).toHaveBeenCalledWith("seller-1");
			expect(sendSuccess).toHaveBeenCalledWith(mockRes, {
				statusCode: StatusCodes.OK,
				data: mockOrders,
				message: "Seller orders retrieved successfully",
			});
		});
	});

	describe("updateSellerOrderStatus", () => {
		it("should update seller order status successfully", async () => {
			const mockOrder = { _id: "order1", status: "shipped" };
			mockReq.params = { id: "order1" };
			mockReq.body = { status: "shipped" };
			mockReq.user = { id: "seller-1", role: "seller" };

			vi.spyOn(ordersService, "updateStatusBySeller").mockResolvedValue(
				mockOrder
			);

			await ordersController.updateSellerOrderStatus(mockReq, mockRes);

			expect(ordersService.updateStatusBySeller).toHaveBeenCalledWith(
				"order1",
				"shipped",
				"seller-1"
			);
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
