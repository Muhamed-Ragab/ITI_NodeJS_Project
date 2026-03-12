import slugify from "slugify";
import { createCdnProvider } from "../../services/cdn/index.js";
import { ApiError } from "../../utils/errors/api-error.js";
import * as categoryRepository from "./categories.repository.js";

const cdnProvider = createCdnProvider("cloudinary");

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

export const uploadImages = async (id, images) => {
	const category = await categoryRepository.findById(id);

	if (!category) {
		throw ApiError.notFound({
			code: "CATEGORY.NOT_FOUND",
			message: "Category not found",
			details: { id },
		});
	}

	// For categories, we only use the first image since it's a single image field
	const imageUrl = images[0];

	const uploadedImages = await cdnProvider.uploadMany([imageUrl], {
		folder: "categories",
	});

	return await categoryRepository.updateImage(id, uploadedImages[0]);
};

export const getImageUploadPayload = (userId, options = {}) => {
	if (!userId) {
		throw ApiError.unauthorized({
			code: "CATEGORY.UNAUTHORIZED",
			message: "Authentication is required",
		});
	}

	return cdnProvider.getUploadRequestPayload({
		folder: options.folder ?? "categories",
	});
};
