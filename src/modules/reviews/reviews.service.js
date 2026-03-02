import { ApiError } from "../../utils/errors/api-error.js";
import * as productsRepository from "../products/products.repository.js";
import * as reviewsRepository from "./reviews.repository.js";

const ensureProductExists = async (productId) => {
	const product = await productsRepository.findById(productId);
	if (!product) {
		throw ApiError.notFound({
			code: "REVIEW.PRODUCT_NOT_FOUND",
			message: "Product not found",
			details: { productId },
		});
	}
};

const toUserIdString = (review) => {
	const user = review?.user_id;
	if (!user) {
		return "";
	}

	if (typeof user === "string") {
		return user;
	}

	if (typeof user === "object" && user._id) {
		return String(user._id);
	}

	return String(user);
};

const refreshProductRatingStats = async (productId) => {
	const stats = await reviewsRepository.calculateProductRatingStats(productId);
	await productsRepository.updateRatingStats(productId, stats);
};

export const createReview = async (userId, reviewData) => {
	await ensureProductExists(reviewData.product_id);

	const existingReview = await reviewsRepository.findByProductAndUser(
		reviewData.product_id,
		userId
	);
	if (existingReview) {
		throw ApiError.badRequest({
			code: "REVIEW.ALREADY_EXISTS",
			message: "You already reviewed this product",
			details: { productId: reviewData.product_id },
		});
	}

	const created = await reviewsRepository.create({
		product_id: reviewData.product_id,
		user_id: userId,
		rating: reviewData.rating,
		comment: reviewData.comment ?? "",
	});

	await refreshProductRatingStats(reviewData.product_id);

	return await reviewsRepository.findById(created._id);
};

export const getReviewById = async (reviewId) => {
	const review = await reviewsRepository.findById(reviewId);
	if (!review) {
		throw ApiError.notFound({
			code: "REVIEW.NOT_FOUND",
			message: "Review not found",
			details: { reviewId },
		});
	}

	return review;
};

export const listReviewsByProduct = async (productId, filters = {}) => {
	await ensureProductExists(productId);
	return await reviewsRepository.listByProduct(productId, filters);
};

export const updateReview = async (reviewId, userId, userRole, reviewData) => {
	const review = await reviewsRepository.findById(reviewId);
	if (!review) {
		throw ApiError.notFound({
			code: "REVIEW.NOT_FOUND",
			message: "Review not found",
			details: { reviewId },
		});
	}

	const isOwner = toUserIdString(review) === String(userId);
	const isAdmin = userRole === "admin";

	if (!(isOwner || isAdmin)) {
		throw ApiError.forbidden({
			code: "REVIEW.FORBIDDEN",
			message: "You are not allowed to update this review",
		});
	}

	const updated = await reviewsRepository.updateById(reviewId, reviewData);
	await refreshProductRatingStats(review.product_id);
	return updated;
};

export const deleteReview = async (reviewId, userId, userRole) => {
	const review = await reviewsRepository.findById(reviewId);
	if (!review) {
		throw ApiError.notFound({
			code: "REVIEW.NOT_FOUND",
			message: "Review not found",
			details: { reviewId },
		});
	}

	const isOwner = toUserIdString(review) === String(userId);
	const isAdmin = userRole === "admin";

	if (!(isOwner || isAdmin)) {
		throw ApiError.forbidden({
			code: "REVIEW.FORBIDDEN",
			message: "You are not allowed to delete this review",
		});
	}

	const deleted = await reviewsRepository.softDeleteById(reviewId);
	await refreshProductRatingStats(review.product_id);
	return deleted;
};
