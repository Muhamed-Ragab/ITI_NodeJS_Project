import { beforeEach, describe, expect, it, vi } from "vitest";
import * as paymentsRepo from "../../../src/modules/payments/payments.repository.js";
import * as paymentsService from "../../../src/modules/payments/payments.service.js";
import { ApiError } from "../../../src/utils/errors/api-error.js";

describe("Payments Service", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("createPaymentIntent", () => {
		it("should throw error if order not found", async () => {
			vi.spyOn(paymentsRepo, "findOrderById").mockResolvedValue(null);

			await expect(
				paymentsService.createPaymentIntent("order123", "user123")
			).rejects.toThrow(ApiError);
		});

		it("should throw error if user is not order owner", async () => {
			const mockOrder = {
				_id: "order123",
				user: "differentUser",
				total_amount: 100,
				status: "pending",
			};
			vi.spyOn(paymentsRepo, "findOrderById").mockResolvedValue(mockOrder);

			await expect(
				paymentsService.createPaymentIntent("order123", "user123")
			).rejects.toThrow(ApiError);
		});

		it("should throw error if order is not pending", async () => {
			const mockOrder = {
				_id: "order123",
				user: "user123",
				total_amount: 100,
				status: "paid",
			};
			vi.spyOn(paymentsRepo, "findOrderById").mockResolvedValue(mockOrder);

			await expect(
				paymentsService.createPaymentIntent("order123", "user123")
			).rejects.toThrow(ApiError);
		});
	});

	describe("handleStripeWebhook", () => {
		it("should throw error for invalid webhook signature", async () => {
			// Test that the service handles invalid signature errors properly
			await expect(
				paymentsService.handleStripeWebhook("invalid_sig", "raw_body")
			).rejects.toThrow(ApiError);
		});
	});

	describe("listPaymentsForAdmin", () => {
		it("should return paginated payments for admin", async () => {
			const mockResult = {
				payments: [{ _id: "order1" }],
				pagination: { page: 1, limit: 10, total: 1, pages: 1 },
			};
			vi.spyOn(paymentsRepo, "listPaymentsForAdmin").mockResolvedValue(
				mockResult
			);

			const result = await paymentsService.listPaymentsForAdmin({
				page: "1",
				limit: "10",
			});
			expect(result).toEqual(mockResult);
		});
	});
});
