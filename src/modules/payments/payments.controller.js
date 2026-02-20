import { StatusCodes } from "http-status-codes";
import { ApiError } from "../../utils/errors/api-error.js";
import { sendSuccess } from "../../utils/response.js";
import * as service from "./payments.service.js";

export const createPaymentIntent = async (req, res) => {
	const userId = req.user.id;
	const { orderId } = req.body;
	const result = await service.createPaymentIntent(orderId, userId);
	return sendSuccess(res, {
		statusCode: StatusCodes.OK,
		data: result,
		message: "Payment intent created successfully",
	});
};

export const stripeWebhook = async (req, res) => {
	const signature = req.headers["stripe-signature"];
	if (!signature) {
		throw ApiError.badRequest({
			code: "PAYMENT.MISSING_SIGNATURE",
			message: "Missing Stripe signature header",
		});
	}

	const rawBody = req.body;
	const result = await service.handleStripeWebhook(signature, rawBody);
	return sendSuccess(res, {
		statusCode: StatusCodes.OK,
		data: result,
		message: "Webhook processed successfully",
	});
};
