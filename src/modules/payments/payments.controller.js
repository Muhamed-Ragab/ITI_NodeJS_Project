import { StatusCodes } from "http-status-codes";
import { ApiError } from "../../utils/errors/api-error.js";
import { sendSuccess } from "../../utils/response.js";
import * as service from "./payments.service.js";

export const createPaymentIntent = async (req, res, next) => {
	try {
		const userId = req.user.id;
		const { orderId } = req.body;
		const result = await service.createPaymentIntent(orderId, userId);
		return sendSuccess(res, {
			statusCode: StatusCodes.OK,
			data: result,
			message: "Payment intent created successfully",
		});
	} catch (error) {
		next(
			error instanceof ApiError
				? error
				: ApiError.internal({
						code: "PAYMENT.CREATE_FAILED",
						message: "Failed to create payment intent",
						details: { message: error.message },
					})
		);
	}
};

export const stripeWebhook = async (req, res, next) => {
	try {
		const signature = req.headers["stripe-signature"];
		if (!signature) {
			return next(
				ApiError.badRequest({
					code: "PAYMENT.MISSING_SIGNATURE",
					message: "Missing Stripe signature header",
				})
			);
		}

		const rawBody = req.body;
		const result = await service.handleStripeWebhook(signature, rawBody);
		return sendSuccess(res, {
			statusCode: StatusCodes.OK,
			data: result,
			message: "Webhook processed successfully",
		});
	} catch (error) {
		next(
			error instanceof ApiError
				? error
				: ApiError.internal({
						code: "PAYMENT.WEBHOOK_FAILED",
						message: "Failed to process webhook",
						details: { message: error.message },
					})
		);
	}
};
