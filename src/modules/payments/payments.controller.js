import { StatusCodes } from "http-status-codes";
import { ApiError } from "../../utils/errors/api-error.js";
import { sendSuccess } from "../../utils/response.js";
import * as service from "./payments.service.js";

export const createPaymentIntent = async (req, res) => {
	const userId = req.user?.id || null;
	const { orderId } = req.body;
	const guestEmail = req.user?.guestEmail || req.body.guestEmail || null;
	const result = await service.createPaymentIntent(orderId, userId, guestEmail);
	return sendSuccess(res, {
		statusCode: StatusCodes.OK,
		data: result,
		message: "Payment intent created successfully",
	});
};

export const createGuestPaymentIntent = async (req, res) => {
	const { orderId, guestEmail } = req.body;
	const result = await service.createPaymentIntent(orderId, null, guestEmail);
	return sendSuccess(res, {
		statusCode: StatusCodes.OK,
		data: result,
		message: "Guest payment intent created successfully",
	});
};

export const processCheckoutPayment = async (req, res) => {
	const userId = req.user?.id || null;
	const { orderId, method, savedMethodId, guestEmail } = req.body;
	const result = await service.processCheckoutPayment(
		orderId,
		userId,
		method,
		savedMethodId,
		guestEmail
	);

	return sendSuccess(res, {
		statusCode: StatusCodes.OK,
		data: result,
		message: "Checkout payment processed successfully",
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

export const listPaymentsForAdmin = async (req, res) => {
	const result = await service.listPaymentsForAdmin(req.query);

	return sendSuccess(res, {
		statusCode: StatusCodes.OK,
		data: result,
		message: "Payments retrieved successfully",
	});
};
