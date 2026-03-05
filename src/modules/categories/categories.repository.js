import {
	buildPaginationMeta,
	parsePagination,
} from "../../utils/pagination.js";
import CategoryModel from "./categories.model.js";

export const create = async (category) => {
	return await CategoryModel.create(category);
};

export const findById = async (id) => {
	return await CategoryModel.findOne({ _id: id, deletedAt: null });
};

export const updateById = async (id, category) => {
	return await CategoryModel.findOneAndUpdate(
		{ _id: id, deletedAt: null },
		category,
		{
			new: true,
			runValidators: true,
		}
	);
};

export const deleteById = async (id) => {
	return await CategoryModel.findOneAndUpdate(
		{ _id: id, deletedAt: null },
		{ deletedAt: new Date() },
		{ new: true }
	);
};

export const list = async (filters = {}) => {
	const { page, limit, skip } = parsePagination(filters);
	const query = { deletedAt: null };
	const [categories, total] = await Promise.all([
		CategoryModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
		CategoryModel.countDocuments(query),
	]);

	return {
		categories,
		pagination: buildPaginationMeta({ page, limit, total }),
	};
};
