import mongoose from "mongoose";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as couponsService from "../../../src/modules/coupons/coupons.service.js";
import * as ordersRepo from "../../../src/modules/orders/orders.repository.js";
import * as ordersService from "../../../src/modules/orders/orders.service.js";
import ProductModel from "../../../src/modules/products/products.model.js";
import * as usersRepo from "../../../src/modules/users/users.repository.js";
import * as orderNotifications from "../../../src/services/notifications/order-notifications.js";
import { ApiError } from "../../../src/utils/errors/api-error.js";

vi.mock("../../../src/modules/coupons/coupons.service.js", () => ({
	validateCouponForOrder: vi.fn(),
	consumeCouponUsage: vi.fn(),
}));

vi.mock("../../../src/services/notifications/order-notifications.js", () => ({
	sendOrderStatusNotification: vi.fn(),
}));

describe("Orders Service", () => {
	const mockSession = {
		withTransaction: vi.fn(async (fn) => await fn()),
		endSession: vi.fn(async () => undefined),
	};

	const setProductFindResult = (products) => {
		vi.spyOn(ProductModel, "find").mockReturnValue({
			select: vi.fn().mockResolvedValue(products),
		});
	};

	beforeEach(() => {
		vi.clearAllMocks();
		vi.spyOn(mongoose, "startSession").mockResolvedValue(mockSession);
		mockSession.withTransaction.mockImplementation(async (fn) => await fn());
		mockSession.endSession.mockResolvedValue(undefined);
		setProductFindResult([]);
		orderNotifications.sendOrderStatusNotification.mockResolvedValue({
			sent: true,
		});
	});

	describe("createOrderFromCart", () => {
		it("should create order from user cart successfully", async () => {
			const mockUser = {
				_id: "user123",
				cart: [
					{ product: "product1", quantity: 2 },
					{ product: "product2", quantity: 1 },
				],
				addresses: [
					{
						street: "123 Main St",
						city: "Test City",
						country: "Test Country",
						zip: "12345",
					},
				],
			};

			const mockProducts = [
				{
					_id: "product1",
					title: "Test Product 1",
					price: 100,
					stock_quantity: 5,
				},
				{
					_id: "product2",
					title: "Test Product 2",
					price: 50,
					stock_quantity: 3,
				},
			];

			const mockOrder = {
				_id: "order123",
				user: "user123",
				subtotal_amount: 250,
				discount_amount: 0,
				shipping_amount: 0,
				tax_amount: 0,
				total_amount: 250,
				status: "pending",
				shipping_address: {
					street: "123 Main St",
					city: "Test City",
					country: "Test Country",
					zip: "12345",
				},
				items: [
					{
						product: "product1",
						title: "Test Product 1",
						price: 100,
						quantity: 2,
					},
					{
						product: "product2",
						title: "Test Product 2",
						price: 50,
						quantity: 1,
					},
				],
			};

			vi.spyOn(usersRepo, "findById").mockResolvedValue(mockUser);
			vi.spyOn(ordersRepo, "create").mockResolvedValue(mockOrder);
			vi.spyOn(usersRepo, "updateById").mockResolvedValue({
				...mockUser,
				cart: [],
			});
			setProductFindResult(mockProducts);

			const result = await ordersService.createOrderFromCart("user123", {});

			expect(result).toEqual(mockOrder);
			expect(usersRepo.findById).toHaveBeenCalledWith("user123");
			expect(ordersRepo.create).toHaveBeenCalled();
			expect(ordersRepo.create).toHaveBeenCalledWith(
				expect.objectContaining({
					subtotal_amount: 250,
					discount_amount: 0,
					shipping_amount: 0,
					tax_amount: 0,
					total_amount: 250,
				})
			);
			expect(usersRepo.updateById).toHaveBeenCalledWith("user123", {
				cart: [],
			});
		});

		it("should throw error if user not found", async () => {
			vi.spyOn(usersRepo, "findById").mockResolvedValue(null);

			await expect(
				ordersService.createOrderFromCart("user123")
			).rejects.toThrow(ApiError);
		});

		it("should throw error if cart is empty", async () => {
			const mockUser = { _id: "user123", cart: [] };
			vi.spyOn(usersRepo, "findById").mockResolvedValue(mockUser);

			await expect(
				ordersService.createOrderFromCart("user123")
			).rejects.toThrow(ApiError);
		});

		it("should throw error if product not found", async () => {
			const mockUser = {
				_id: "user123",
				cart: [{ product: "nonexistent", quantity: 1 }],
			};

			vi.spyOn(usersRepo, "findById").mockResolvedValue(mockUser);
			setProductFindResult([]);

			await expect(
				ordersService.createOrderFromCart("user123")
			).rejects.toThrow(ApiError);
		});

		it("should throw error if insufficient stock", async () => {
			const mockUser = {
				_id: "user123",
				cart: [{ product: "product1", quantity: 10 }],
			};

			const mockProducts = [
				{
					_id: "product1",
					title: "Test Product",
					price: 100,
					stock_quantity: 5,
				},
			];

			vi.spyOn(usersRepo, "findById").mockResolvedValue(mockUser);
			setProductFindResult(mockProducts);

			await expect(
				ordersService.createOrderFromCart("user123")
			).rejects.toThrow(ApiError);
		});

		it("should apply coupon snapshot and consume coupon usage", async () => {
			const mockUser = {
				_id: "user123",
				email: "user@test.com",
				name: "User",
				cart: [{ product: "product1", quantity: 1 }],
				addresses: [],
			};

			setProductFindResult([
				{
					_id: "product1",
					title: "Test Product",
					price: 100,
					stock_quantity: 5,
				},
			]);

			vi.spyOn(usersRepo, "findById").mockResolvedValue(mockUser);
			couponsService.validateCouponForOrder.mockResolvedValue({
				coupon: { _id: "coupon1" },
				discountAmount: 20,
				couponInfo: {
					code: "SAVE20",
					type: "fixed",
					value: 20,
					discount_amount: 20,
				},
			});
			couponsService.consumeCouponUsage.mockResolvedValue({ _id: "coupon1" });
			vi.spyOn(ordersRepo, "create").mockResolvedValue({ _id: "order123" });
			vi.spyOn(usersRepo, "updateById").mockResolvedValue({
				...mockUser,
				cart: [],
			});

			await ordersService.createOrderFromCart("user123", {
				couponCode: "save20",
			});

			expect(couponsService.validateCouponForOrder).toHaveBeenCalledWith({
				code: "save20",
				userId: "user123",
				subtotalAmount: 100,
			});
			expect(ordersRepo.create).toHaveBeenCalledWith(
				expect.objectContaining({
					subtotal_amount: 100,
					discount_amount: 20,
					total_amount: 80,
					coupon_info: expect.objectContaining({ code: "SAVE20" }),
					status_timeline: [
						expect.objectContaining({ status: "pending", source: "system" }),
					],
				})
			);
			expect(couponsService.consumeCouponUsage).toHaveBeenCalledWith(
				"coupon1",
				"user123"
			);
		});

		it("should store normalized payment method for cart checkout", async () => {
			const mockUser = {
				_id: "user123",
				email: "user@test.com",
				name: "User",
				cart: [{ product: "product1", quantity: 1 }],
				addresses: [],
			};

			setProductFindResult([
				{
					_id: "product1",
					title: "Test Product",
					price: 100,
					stock_quantity: 5,
					seller_id: "seller123",
				},
			]);

			vi.spyOn(usersRepo, "findById").mockResolvedValue(mockUser);
			vi.spyOn(ordersRepo, "create").mockResolvedValue({ _id: "order123" });
			vi.spyOn(usersRepo, "updateById").mockResolvedValue({
				...mockUser,
				cart: [],
			});

			await ordersService.createOrderFromCart("user123", {
				paymentMethod: "COD",
			});

			expect(ordersRepo.create).toHaveBeenCalledWith(
				expect.objectContaining({
					payment_info: expect.objectContaining({ method: "cod" }),
				})
			);
		});

		it("should reject unsupported payment method", async () => {
			const mockUser = {
				_id: "user123",
				cart: [{ product: "product1", quantity: 1 }],
				addresses: [],
			};

			setProductFindResult([
				{
					_id: "product1",
					title: "Test Product",
					price: 100,
					stock_quantity: 5,
				},
			]);

			vi.spyOn(usersRepo, "findById").mockResolvedValue(mockUser);

			await expect(
				ordersService.createOrderFromCart("user123", {
					paymentMethod: "bank-transfer",
				})
			).rejects.toThrow(ApiError);
		});
	});

	describe("createGuestOrder", () => {
		it("should create guest order with normalized payment method", async () => {
			setProductFindResult([
				{
					_id: "product1",
					title: "Guest Product",
					price: 50,
					stock_quantity: 10,
					seller_id: "seller123",
				},
			]);

			vi.spyOn(ordersRepo, "create").mockResolvedValue({
				_id: "guest-order-1",
			});

			await ordersService.createGuestOrder({
				guest_info: {
					name: "Guest User",
					email: "guest@test.com",
				},
				items: [{ product: "product1", quantity: 2 }],
				paymentMethod: "PayPal",
			});

			expect(ordersRepo.create).toHaveBeenCalledWith(
				expect.objectContaining({
					user: null,
					guest_info: expect.objectContaining({ email: "guest@test.com" }),
					payment_info: expect.objectContaining({ method: "paypal" }),
				})
			);
			expect(
				orderNotifications.sendOrderStatusNotification
			).toHaveBeenCalledWith(
				expect.objectContaining({
					email: "guest@test.com",
					status: "pending",
				})
			);
		});
	});

	describe("getOrderById", () => {
		it("should return order for owner", async () => {
			const mockOrder = { _id: "order123", user: "user123" };
			vi.spyOn(ordersRepo, "findById").mockResolvedValue(mockOrder);

			const result = await ordersService.getOrderById(
				"order123",
				"user123",
				"customer"
			);
			expect(result).toEqual(mockOrder);
		});

		it("should return order for admin", async () => {
			const mockOrder = { _id: "order123", user: "otheruser" };
			vi.spyOn(ordersRepo, "findById").mockResolvedValue(mockOrder);

			const result = await ordersService.getOrderById(
				"order123",
				"adminuser",
				"admin"
			);
			expect(result).toEqual(mockOrder);
		});

		it("should throw forbidden error for non-owner/non-admin", async () => {
			const mockOrder = { _id: "order123", user: "otheruser" };
			vi.spyOn(ordersRepo, "findById").mockResolvedValue(mockOrder);

			await expect(
				ordersService.getOrderById("order123", "differentuser", "customer")
			).rejects.toThrow(ApiError);
		});

		it("should return order for seller owning at least one order item", async () => {
			const mockOrder = {
				_id: "order123",
				user: "customer-1",
				items: [{ seller_id: "seller-1" }],
			};
			vi.spyOn(ordersRepo, "findById").mockResolvedValue(mockOrder);

			const result = await ordersService.getOrderById(
				"order123",
				"seller-1",
				"seller"
			);

			expect(result).toEqual(mockOrder);
		});
	});

	describe("listOrdersByUser", () => {
		it("should return orders for user", async () => {
			const mockOrders = [{ _id: "order1", user: "user123" }];
			vi.spyOn(ordersRepo, "findByUser").mockResolvedValue(mockOrders);

			const result = await ordersService.listOrdersByUser("user123");
			expect(result).toEqual(mockOrders);
		});
	});

	describe("listOrdersBySeller", () => {
		it("should return seller-scoped orders", async () => {
			const mockOrders = [
				{ _id: "order1", items: [{ seller_id: "seller123" }] },
			];
			vi.spyOn(ordersRepo, "findBySeller").mockResolvedValue(mockOrders);

			const result = await ordersService.listOrdersBySeller("seller123");
			expect(result).toEqual(mockOrders);
			expect(ordersRepo.findBySeller).toHaveBeenCalledWith("seller123");
		});
	});

	describe("updateStatus", () => {
		it("should update order status successfully", async () => {
			const mockOrder = { _id: "order123", status: "pending" };
			vi.spyOn(ordersRepo, "findById").mockResolvedValue(mockOrder);
			vi.spyOn(ordersRepo, "updateStatusById").mockResolvedValue({
				...mockOrder,
				user: "user123",
				status: "paid",
			});
			vi.spyOn(usersRepo, "findById").mockResolvedValue({
				_id: "user123",
				email: "user@test.com",
				name: "User",
			});

			const result = await ordersService.updateStatus(
				"order123",
				"paid",
				"admin"
			);
			expect(result.status).toBe("paid");
			expect(orderNotifications.sendOrderStatusNotification).toHaveBeenCalled();
		});

		it("should throw error for invalid status", async () => {
			const mockOrder = { _id: "order123", status: "pending" };
			vi.spyOn(ordersRepo, "findById").mockResolvedValue(mockOrder);

			await expect(
				ordersService.updateStatus("order123", "invalid", "admin")
			).rejects.toThrow(ApiError);
		});
	});

	describe("updateStatusBySeller", () => {
		it("should update status when seller owns order item", async () => {
			vi.spyOn(ordersRepo, "findById").mockResolvedValue({
				_id: "order123",
				user: "customer-1",
				items: [{ seller_id: "seller-1" }],
			});
			vi.spyOn(ordersRepo, "updateStatusById").mockResolvedValue({
				_id: "order123",
				status: "shipped",
			});
			vi.spyOn(usersRepo, "findById").mockResolvedValue({
				_id: "customer-1",
				email: "customer@test.com",
				name: "Customer",
			});

			const result = await ordersService.updateStatusBySeller(
				"order123",
				"shipped",
				"seller-1"
			);

			expect(result.status).toBe("shipped");
			expect(ordersRepo.updateStatusById).toHaveBeenCalledWith(
				"order123",
				"shipped",
				"seller"
			);
			expect(orderNotifications.sendOrderStatusNotification).toHaveBeenCalled();
		});

		it("should reject seller status update when seller is not in order items", async () => {
			vi.spyOn(ordersRepo, "findById").mockResolvedValue({
				_id: "order123",
				items: [{ seller_id: "another-seller" }],
			});

			await expect(
				ordersService.updateStatusBySeller("order123", "shipped", "seller-1")
			).rejects.toThrow(ApiError);
		});
	});
});
