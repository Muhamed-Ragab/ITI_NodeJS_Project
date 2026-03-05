import mongoose from "mongoose";
import {
	buildPaginationMeta,
	parsePagination,
} from "../../utils/pagination.js";
import ReviewModel from "./reviews.model.js";

export const create = async (reviewData) => {
	return await ReviewModel.create(reviewData);
};

export const findById = async (reviewId) => {
	return await ReviewModel.findOne({
		_id: reviewId,
		deletedAt: null,
	}).populate("user_id", "name");
};

export const findByProductAndUser = async (productId, userId) => {
	return await ReviewModel.findOne({
		product_id: productId,
		user_id: userId,
		deletedAt: null,
	});
};

export const updateById = async (reviewId, reviewData) => {
	return await ReviewModel.findOneAndUpdate(
		{ _id: reviewId, deletedAt: null },
		reviewData,
		{ new: true, runValidators: true }
	).populate("user_id", "name");
};

export const softDeleteById = async (reviewId) => {
	return await ReviewModel.findOneAndUpdate(
		{ _id: reviewId, deletedAt: null },
		{ deletedAt: new Date() },
		{ new: true }
	).populate("user_id", "name");
};

export const listByProduct = async (productId, filters = {}) => {
	const { page, limit, skip } = parsePagination(filters);
	const query = {
		product_id: productId,
		deletedAt: null,
	};

	const [reviews, total] = await Promise.all([
		ReviewModel.find(query)
			.populate("user_id", "name")
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(limit),
		ReviewModel.countDocuments(query),
	]);

	return {
		reviews,
		pagination: buildPaginationMeta({ page, limit, total }),
	};
};

export const calculateProductRatingStats = async (productId) => {
	const [stats] = await ReviewModel.aggregate([
		{
			$match: {
				product_id: new mongoose.Types.ObjectId(productId),
				deletedAt: null,
			},
		},
		{
			$group: {
				_id: "$product_id",
				average_rating: { $avg: "$rating" },
				ratings_count: { $sum: 1 },
			},
		},
	]);

	if (!stats) {
		return {
			average_rating: 0,
			ratings_count: 0,
		};
	}

	return {
		average_rating: Number(stats.average_rating.toFixed(2)),
		ratings_count: stats.ratings_count,
	};
};
