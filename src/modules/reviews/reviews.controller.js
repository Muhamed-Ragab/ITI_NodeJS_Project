import { StatusCodes } from "http-status-codes";
import { sendSuccess } from "../../utils/response.js";
import * as reviewsService from "./reviews.service.js";

export const createReview = async (req, res) => {
	const review = await reviewsService.createReview(req.user.id, req.body);

	return sendSuccess(res, {
		statusCode: StatusCodes.CREATED,
		data: review,
		message: "Review created successfully",
	});
};

export const getReviewById = async (req, res) => {
	const review = await reviewsService.getReviewById(req.params.id);

	return sendSuccess(res, {
		statusCode: StatusCodes.OK,
		data: review,
		message: "Review retrieved successfully",
	});
};

export const listProductReviews = async (req, res) => {
	const result = await reviewsService.listReviewsByProduct(
		req.params.productId,
		req.query
	);

	return sendSuccess(res, {
		statusCode: StatusCodes.OK,
		data: result,
		message: "Reviews retrieved successfully",
	});
};

export const updateReview = async (req, res) => {
	const review = await reviewsService.updateReview(
		req.params.id,
		req.user.id,
		req.user.role,
		req.body
	);

	return sendSuccess(res, {
		statusCode: StatusCodes.OK,
		data: review,
		message: "Review updated successfully",
	});
};

export const deleteReview = async (req, res) => {
	const review = await reviewsService.deleteReview(
		req.params.id,
		req.user.id,
		req.user.role
	);

	return sendSuccess(res, {
		statusCode: StatusCodes.OK,
		data: review,
		message: "Review deleted successfully",
	});
};
