import { StatusCodes } from "http-status-codes";
import { sendError, sendSuccess } from "../../utils/response.js";
import * as categoryService from "./categories.service.js";

// Create Category
export const createCategory = async (req, res) => {
	try {
		const category = await categoryService.createCategory(req.body);

		return sendSuccess(res, {
			statusCode: StatusCodes.CREATED,
			data: category,
			message: "Category created successfully",
		});
	} catch (error) {
		if (error.code === 11_000) {
			return sendError(res, {
				statusCode: StatusCodes.CONFLICT,
				code: "CATEGORY.DUPLICATE",
				message: "Category with this name already exists",
			});
		}
		return sendError(res, {
			statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
			code: "CATEGORY.CREATE_FAILED",
			details: { message: error.message },
			message: "Failed to create category",
		});
	}
};

// Get Category By ID
export const getCategoryById = async (req, res) => {
	try {
		const category = await categoryService.getCategoryById(req.params.id);

		if (!category) {
			return sendError(res, {
				statusCode: StatusCodes.NOT_FOUND,
				code: "CATEGORY.NOT_FOUND",
				details: { id: req.params.id },
				message: "Category not found",
			});
		}

		return sendSuccess(res, {
			statusCode: StatusCodes.OK,
			data: category,
			message: "Category retrieved successfully",
		});
	} catch (error) {
		if (error.name === "CastError") {
			return sendError(res, {
				statusCode: StatusCodes.BAD_REQUEST,
				code: "CATEGORY.INVALID_ID",
				message: "Invalid category ID format",
			});
		}
		return sendError(res, {
			statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
			code: "CATEGORY.RETRIEVE_FAILED",
			details: { id: req.params.id, message: error.message },
			message: "Failed to retrieve category",
		});
	}
};

// Update Category
export const updateCategory = async (req, res) => {
	try {
		const category = await categoryService.updateCategory(
			req.params.id,
			req.body
		);

		if (!category) {
			return sendError(res, {
				statusCode: StatusCodes.NOT_FOUND,
				code: "CATEGORY.NOT_FOUND",
				details: { id: req.params.id },
				message: "Category not found",
			});
		}

		return sendSuccess(res, {
			statusCode: StatusCodes.OK,
			data: category,
			message: "Category updated successfully",
		});
	} catch (error) {
		if (error.name === "CastError") {
			return sendError(res, {
				statusCode: StatusCodes.BAD_REQUEST,
				code: "CATEGORY.INVALID_ID",
				message: "Invalid category ID format",
			});
		}
		if (error.code === 11_000) {
			return sendError(res, {
				statusCode: StatusCodes.CONFLICT,
				code: "CATEGORY.DUPLICATE",
				message: "Category with this name already exists",
			});
		}
		return sendError(res, {
			statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
			code: "CATEGORY.UPDATE_FAILED",
			details: { message: error.message },
			message: "Failed to update category",
		});
	}
};

// Delete Category
export const deleteCategory = async (req, res) => {
	try {
		const category = await categoryService.deleteCategory(req.params.id);

		if (!category) {
			return sendError(res, {
				statusCode: StatusCodes.NOT_FOUND,
				code: "CATEGORY.NOT_FOUND",
				details: { id: req.params.id },
				message: "Category not found",
			});
		}

		return sendSuccess(res, {
			statusCode: StatusCodes.OK,
			data: category,
			message: "Category deleted successfully",
		});
	} catch (error) {
		if (error.name === "CastError") {
			return sendError(res, {
				statusCode: StatusCodes.BAD_REQUEST,
				code: "CATEGORY.INVALID_ID",
				message: "Invalid category ID format",
			});
		}
		return sendError(res, {
			statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
			code: "CATEGORY.DELETE_FAILED",
			details: { message: error.message },
			message: "Failed to delete category",
		});
	}
};

// List Categories
export const listCategories = async (_req, res) => {
	try {
		const categories = await categoryService.listCategories();

		return sendSuccess(res, {
			statusCode: StatusCodes.OK,
			data: categories,
			message: "Categories retrieved successfully",
		});
	} catch (error) {
		return sendError(res, {
			statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
			code: "CATEGORY.LIST_FAILED",
			details: { message: error.message },
			message: "Failed to list categories",
		});
	}
};
