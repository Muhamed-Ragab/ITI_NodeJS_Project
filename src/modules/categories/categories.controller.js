import { StatusCodes } from "http-status-codes";
import { sendSuccess } from "../../utils/response.js";
import * as categoryService from "./categories.service.js";

export const createCategory = async (req, res) => {
	const category = await categoryService.createCategory(req.body);

	return sendSuccess(res, {
		statusCode: StatusCodes.CREATED,
		data: category,
		message: "Category created successfully",
	});
};

export const getCategoryById = async (req, res) => {
	const category = await categoryService.getCategoryById(req.params.id);

	return sendSuccess(res, {
		statusCode: StatusCodes.OK,
		data: category,
		message: "Category retrieved successfully",
	});
};

export const updateCategory = async (req, res) => {
	const category = await categoryService.updateCategory(
		req.params.id,
		req.body
	);

	return sendSuccess(res, {
		statusCode: StatusCodes.OK,
		data: category,
		message: "Category updated successfully",
	});
};

export const deleteCategory = async (req, res) => {
	const category = await categoryService.deleteCategory(req.params.id);

	return sendSuccess(res, {
		statusCode: StatusCodes.OK,
		data: category,
		message: "Category deleted successfully",
	});
};

export const listCategories = async (req, res) => {
	const result = await categoryService.listCategories(req.query);

	return sendSuccess(res, {
		statusCode: StatusCodes.OK,
		data: result,
		message: "Categories retrieved successfully",
	});
};
