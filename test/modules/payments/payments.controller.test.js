import { StatusCodes } from "http-status-codes";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as paymentsController from "../../../src/modules/payments/payments.controller.js";
import * as paymentsService from "../../../src/modules/payments/payments.service.js";
import { sendSuccess } from "../../../src/utils/response.js";

// Mock sendSuccess
vi.mock("../../../src/utils/response.js", () => ({
	sendSuccess: vi.fn(),
}));

describe("Payments Controller", () => {
	let mockReq, mockRes;

	beforeEach(() => {
		mockReq = {};
		mockRes = {
			status: vi.fn().mockReturnThis(),
			json: vi.fn(),
		};
		vi.clearAllMocks();
	});

	describe("createPaymentIntent", () => {
		it("should create payment intent successfully", async () => {
			const mockResult = {
				clientSecret: "cs_123",
				paymentIntentId: "pi_123",
			};

			mockReq.user = { id: "user123" };
			mockReq.body = { orderId: "order123" };

			vi.spyOn(paymentsService, "createPaymentIntent").mockResolvedValue(
				mockResult
			);

			await paymentsController.createPaymentIntent(mockReq, mockRes);

			expect(sendSuccess).toHaveBeenCalledWith(mockRes, {
				statusCode: StatusCodes.OK,
				data: mockResult,
				message: "Payment intent created successfully",
			});
		});
	});

	describe("stripeWebhook", () => {
		it("should handle webhook successfully", async () => {
			const mockResult = { received: true };

			mockReq.headers = { "stripe-signature": "sig_123" };
			mockReq.body = "raw_body";

			vi.spyOn(paymentsService, "handleStripeWebhook").mockResolvedValue(
				mockResult
			);

			await paymentsController.stripeWebhook(mockReq, mockRes);

			expect(sendSuccess).toHaveBeenCalledWith(mockRes, {
				statusCode: StatusCodes.OK,
				data: mockResult,
				message: "Webhook processed successfully",
			});
		});

		it("should throw error for missing stripe signature", async () => {
			mockReq.headers = {};
			mockReq.body = "raw_body";

			await expect(
				paymentsController.stripeWebhook(mockReq, mockRes)
			).rejects.toThrow();
		});
	});

	describe("listPaymentsForAdmin", () => {
		it("should list payments for admin successfully", async () => {
			const mockResult = {
				payments: [{ _id: "o1" }],
				pagination: { page: 1, limit: 10, total: 1, pages: 1 },
			};

			mockReq.query = { page: "1", limit: "10" };
			vi.spyOn(paymentsService, "listPaymentsForAdmin").mockResolvedValue(
				mockResult
			);

			await paymentsController.listPaymentsForAdmin(mockReq, mockRes);

			expect(sendSuccess).toHaveBeenCalledWith(mockRes, {
				statusCode: StatusCodes.OK,
				data: mockResult,
				message: "Payments retrieved successfully",
			});
		});
	});
});
