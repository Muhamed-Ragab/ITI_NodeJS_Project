import { describe, it, expect, beforeEach, vi } from 'vitest';
import { StatusCodes } from 'http-status-codes';
import * as paymentsController from '../../../src/modules/payments/payments.controller.js';
import * as paymentsService from '../../../src/modules/payments/payments.service.js';
import { sendSuccess } from '../../../src/utils/response.js';

// Mock sendSuccess
vi.mock('../../../src/utils/response.js', () => ({
	sendSuccess: vi.fn(),
}));

describe('Payments Controller', () => {
	let mockReq, mockRes;

	beforeEach(() => {
		mockReq = {};
		mockRes = {
			status: vi.fn().mockReturnThis(),
			json: vi.fn(),
		};
		vi.clearAllMocks();
	});

	describe('createPaymentIntent', () => {
		it('should create payment intent successfully', async () => {
			const mockResult = {
				clientSecret: 'cs_123',
				paymentIntentId: 'pi_123'
			};
			
			mockReq.user = { id: 'user123' };
			mockReq.body = { orderId: 'order123' };
			
			vi.spyOn(paymentsService, 'createPaymentIntent').mockResolvedValue(mockResult);

			await paymentsController.createPaymentIntent(mockReq, mockRes);

			expect(sendSuccess).toHaveBeenCalledWith(mockRes, {
				statusCode: StatusCodes.OK,
				data: mockResult,
				message: 'Payment intent created successfully',
			});
		});
	});

	describe('stripeWebhook', () => {
		it('should handle webhook successfully', async () => {
			const mockResult = { received: true };
			
			mockReq.headers = { 'stripe-signature': 'sig_123' };
			mockReq.body = 'raw_body';
			
			vi.spyOn(paymentsService, 'handleStripeWebhook').mockResolvedValue(mockResult);

			await paymentsController.stripeWebhook(mockReq, mockRes);

			expect(sendSuccess).toHaveBeenCalledWith(mockRes, {
				statusCode: StatusCodes.OK,
				data: mockResult,
				message: 'Webhook processed successfully',
			});
		});

		it('should throw error for missing stripe signature', async () => {
			mockReq.headers = {};
			mockReq.body = 'raw_body';

			await expect(paymentsController.stripeWebhook(mockReq, mockRes)).rejects.toThrow();
		});
	});
});