import {
	buildPaginationMeta,
	parsePagination,
} from "../../utils/pagination.js";
import OrderModel from "../orders/orders.model.js";
import ProductModel from "./products.model.js";

export const create = async (product) => {
	return await ProductModel.create(product);
};

export const findById = async (id) => {
	return await ProductModel.findOne({ _id: id, deletedAt: null })
		.populate("seller_id", "name email")
		.populate("category_id", "name slug");
};

export const updateById = async (id, product) => {
	return await ProductModel.findOneAndUpdate(
		{ _id: id, deletedAt: null },
		product,
		{
			new: true,
			runValidators: true,
		}
	)
		.populate("seller_id", "name email")
		.populate("category_id", "name slug");
};

export const deleteById = async (id) => {
	return await ProductModel.findOneAndUpdate(
		{ _id: id, deletedAt: null },
		{ deletedAt: new Date(), is_active: false },
		{ new: true }
	);
};

export const listWithFilters = async (filters = {}) => {
	const { category_id, min_price, max_price, search, is_active } = filters;
	const { page, limit, skip } = parsePagination(filters);

	const query = { deletedAt: null };

	if (category_id) {
		query.category_id = category_id;
	}
	if (is_active !== undefined) {
		query.is_active = is_active;
	}
	if (min_price || max_price) {
		query.price = {};
		if (min_price) {
			query.price.$gte = Number.parseFloat(min_price);
		}
		if (max_price) {
			query.price.$lte = Number.parseFloat(max_price);
		}
	}
	if (search) {
		query.$or = [
			{ title: { $regex: search, $options: "i" } },
			{ description: { $regex: search, $options: "i" } },
		];
	}

	const [products, total] = await Promise.all([
		ProductModel.find(query)
			.populate("seller_id", "name email")
			.populate("category_id", "name slug")
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(limit),
		ProductModel.countDocuments(query),
	]);

	return {
		products,
		pagination: buildPaginationMeta({ page, limit, total }),
	};
};

export const appendImages = async (id, images) => {
	return await ProductModel.findOneAndUpdate(
		{ _id: id, deletedAt: null },
		{ $push: { images: { $each: images } } },
		{ new: true, runValidators: true }
	);
};

export const updateRatingStats = async (id, stats) => {
	return await ProductModel.findOneAndUpdate(
		{ _id: id, deletedAt: null },
		{
			average_rating: stats.average_rating,
			ratings_count: stats.ratings_count,
		},
		{ new: true, runValidators: true }
	);
};

export const getBestSellers = async (limit = 10) => {
	const result = await OrderModel.aggregate([
		{
			$match: {
				status: { $in: ["paid", "shipped", "delivered"] },
			},
		},
		{ $unwind: "$items" },
		{
			$group: {
				_id: "$items.product",
				total_sold: { $sum: "$items.quantity" },
			},
		},
		{ $sort: { total_sold: -1 } },
		{ $limit: limit },
		{
			$lookup: {
				from: "products",
				let: { productId: "$_id" },
				pipeline: [
					{
						$match: {
							$expr: { $eq: ["$_id", "$$productId"] },
							deletedAt: null,
							is_active: true,
						},
					},
				],
				as: "product",
			},
		},
		{ $unwind: "$product" },
		{
			$replaceRoot: {
				newRoot: {
					$mergeObjects: ["$product", { total_sold: "$total_sold" }],
				},
			},
		},
	]);

	return result;
};
