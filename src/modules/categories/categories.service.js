import slugify from "slugify";
import { ApiError } from "../../utils/errors/api-error.js";
import * as categoryRepository from "./categories.repository.js";

export const createCategory = async (category) => {
	const slug = slugify(category.name, {
		lower: true,
		strict: true,
	});

	return await categoryRepository.create({
		...category,
		slug,
	});
};

export const getCategoryById = async (id) => {
	const category = await categoryRepository.findById(id);

	if (!category) {
		throw ApiError.notFound({
			code: "CATEGORY.NOT_FOUND",
			message: "Category not found",
			details: { id },
		});
	}

	return category;
};

export const updateCategory = async (id, category) => {
	if (category.name) {
		category.slug = slugify(category.name, {
			lower: true,
			strict: true,
		});
	}

	const updatedCategory = await categoryRepository.updateById(id, category);

	if (!updatedCategory) {
		throw ApiError.notFound({
			code: "CATEGORY.NOT_FOUND",
			message: "Category not found",
			details: { id },
		});
	}

	return updatedCategory;
};

export const deleteCategory = async (id) => {
	const deletedCategory = await categoryRepository.deleteById(id);

	if (!deletedCategory) {
		throw ApiError.notFound({
			code: "CATEGORY.NOT_FOUND",
			message: "Category not found",
			details: { id },
		});
	}

	return deletedCategory;
};

export const listCategories = async (filters = {}) => {
	return await categoryRepository.list(filters);
};
