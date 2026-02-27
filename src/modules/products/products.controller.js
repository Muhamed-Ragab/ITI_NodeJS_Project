import { StatusCodes } from "http-status-codes";
import { sendSuccess } from "../../utils/response.js";
import * as productService from "./products.service.js";

export const createProduct = async (req, res) => {
	const product = await productService.createProduct(req.body, req.user.id);

	return sendSuccess(res, {
		statusCode: StatusCodes.CREATED,
		data: product,
		message: "Product created successfully",
	});
};

export const getProductById = async (req, res) => {
	const product = await productService.getProductById(req.params.id);

	return sendSuccess(res, {
		statusCode: StatusCodes.OK,
		data: product,
		message: "Product retrieved successfully",
	});
};

export const updateProduct = async (req, res) => {
	const product = await productService.updateProduct(
		req.params.id,
		req.body,
		req.user.id
	);

	return sendSuccess(res, {
		statusCode: StatusCodes.OK,
		data: product,
		message: "Product updated successfully",
	});
};

export const deleteProduct = async (req, res) => {
	const product = await productService.deleteProduct(
		req.params.id,
		req.user.id
	);

	return sendSuccess(res, {
		statusCode: StatusCodes.OK,
		data: product,
		message: "Product deleted successfully",
	});
};

export const adminUpdateProduct = async (req, res) => {
	const product = await productService.adminUpdateProduct(
		req.params.id,
		req.body
	);

	return sendSuccess(res, {
		statusCode: StatusCodes.OK,
		data: product,
		message: "Product updated successfully",
	});
};

export const adminDeleteProduct = async (req, res) => {
	const product = await productService.adminDeleteProduct(req.params.id);

	return sendSuccess(res, {
		statusCode: StatusCodes.OK,
		data: product,
		message: "Product deleted successfully",
	});
};

export const listProducts = async (req, res) => {
	const result = await productService.listProducts(req.query);

	return sendSuccess(res, {
		statusCode: StatusCodes.OK,
		data: result,
		message: "Products retrieved successfully",
	});
};

export const uploadProductImages = async (req, res) => {
	const product = await productService.uploadImages(
		req.params.id,
		req.body.images,
		req.user.id
	);

	return sendSuccess(res, {
		statusCode: StatusCodes.OK,
		data: product,
		message: "Images uploaded successfully",
	});
};

export const getProductImageUploadPayload = async (req, res) => {
	const payload = await productService.getImageUploadPayload(
		req.user.id,
		req.body
	);

	return sendSuccess(res, {
		statusCode: StatusCodes.OK,
		data: payload,
		message: "Upload payload generated successfully",
	});
};

export const getBestSellers = async (req, res) => {
	const limit = Number(req.query.limit) || 10;
	const products = await productService.getBestSellers(limit);

	return sendSuccess(res, {
		statusCode: StatusCodes.OK,
		data: products,
		message: "Best sellers retrieved successfully",
	});
};
