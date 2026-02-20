import mongoose from "mongoose";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ProductModel from "../../../src/modules/products/products.model.js";
import * as ordersRepo from "../../../src/modules/orders/orders.repository.js";
import * as ordersService from "../../../src/modules/orders/orders.service.js";
import * as usersRepo from "../../../src/modules/users/users.repository.js";
import { ApiError } from "../../../src/utils/errors/api-error.js";

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
			expect(usersRepo.updateById).toHaveBeenCalledWith("user123", {
				cart: [],
			});
		});

		it("should throw error if user not found", async () => {
			vi.spyOn(usersRepo, "findById").mockResolvedValue(null);

			await expect(ordersService.createOrderFromCart("user123")).rejects.toThrow(
				ApiError
			);
		});

		it("should throw error if cart is empty", async () => {
			const mockUser = { _id: "user123", cart: [] };
			vi.spyOn(usersRepo, "findById").mockResolvedValue(mockUser);

			await expect(ordersService.createOrderFromCart("user123")).rejects.toThrow(
				ApiError
			);
		});

		it("should throw error if product not found", async () => {
			const mockUser = {
				_id: "user123",
				cart: [{ product: "nonexistent", quantity: 1 }],
			};

			vi.spyOn(usersRepo, "findById").mockResolvedValue(mockUser);
			setProductFindResult([]);

			await expect(ordersService.createOrderFromCart("user123")).rejects.toThrow(
				ApiError
			);
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

			await expect(ordersService.createOrderFromCart("user123")).rejects.toThrow(
				ApiError
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
				"member"
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
				ordersService.getOrderById("order123", "differentuser", "member")
			).rejects.toThrow(ApiError);
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

	describe("updateStatus", () => {
		it("should update order status successfully", async () => {
			const mockOrder = { _id: "order123", status: "pending" };
			vi.spyOn(ordersRepo, "findById").mockResolvedValue(mockOrder);
			vi.spyOn(ordersRepo, "updateStatusById").mockResolvedValue({
				...mockOrder,
				status: "paid",
			});

			const result = await ordersService.updateStatus(
				"order123",
				"paid",
				"admin"
			);
			expect(result.status).toBe("paid");
		});

		it("should throw error for invalid status", async () => {
			const mockOrder = { _id: "order123", status: "pending" };
			vi.spyOn(ordersRepo, "findById").mockResolvedValue(mockOrder);

			await expect(
				ordersService.updateStatus("order123", "invalid", "admin")
			).rejects.toThrow(ApiError);
		});
	});
});