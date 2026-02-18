import * as productService from "./products.service.js";
import { sendSuccess, sendError } from "../../utils/response.js";
import { StatusCodes } from "http-status-codes";

// Create Product
export const createProduct = async (req, res) => {
	try {
		const product = await productService.createProduct(req.body, req.user.id);

		return sendSuccess(res, {
			statusCode: StatusCodes.CREATED,
			data: product,
			message: "Product created successfully",
		});
	} catch (error) {
		if (error.message.includes("already exists")) {
			return sendError(res, {
				statusCode: StatusCodes.CONFLICT,
				code: "PRODUCT.DUPLICATE",
				details: { message: error.message },
				message: error.message,
			});
		}

		return sendError(res, {
			statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
			code: "PRODUCT.CREATE_FAILED",
			details: { message: error.message },
			message: "Failed to create product",
		});
	}
};

// Get Product By ID
export const getProductById = async (req, res) => {
	try {
		const product = await productService.getProductById(req.params.id);

		if (!product) {
			return sendError(res, {
				statusCode: StatusCodes.NOT_FOUND,
				code: "PRODUCT.NOT_FOUND",
				details: { id: req.params.id },
				message: "Product not found",
			});
		}

		return sendSuccess(res, {
			statusCode: StatusCodes.OK,
			data: product,
			message: "Product retrieved successfully",
		});
	} catch (error) {
		return sendError(res, {
			statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
			code: "PRODUCT.RETRIEVE_FAILED",
			details: { id: req.params.id, message: error.message },
			message: "Failed to retrieve product",
		});
	}
};

// Update Product
export const updateProduct = async (req, res) => {
	try {
		const product = await productService.updateProduct(
			req.params.id,
			req.body,
			req.user.id
		);

		if (!product) {
			return sendError(res, {
				statusCode: StatusCodes.NOT_FOUND,
				code: "PRODUCT.NOT_FOUND",
				details: { id: req.params.id },
				message: "Product not found",
			});
		}

		return sendSuccess(res, {
			statusCode: StatusCodes.OK,
			data: product,
			message: "Product updated successfully",
		});
	} catch (error) {
		if (error.message.includes("Unauthorized")) {
			return sendError(res, {
				statusCode: StatusCodes.FORBIDDEN,
				code: "PRODUCT.UNAUTHORIZED",
				details: { message: error.message },
				message: error.message,
			});
		}

		if (error.message.includes("already exists")) {
			return sendError(res, {
				statusCode: StatusCodes.CONFLICT,
				code: "PRODUCT.DUPLICATE",
				details: { message: error.message },
				message: error.message,
			});
		}

		return sendError(res, {
			statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
			code: "PRODUCT.UPDATE_FAILED",
			details: { message: error.message },
			message: "Failed to update product",
		});
	}
};

// Delete Product
export const deleteProduct = async (req, res) => {
	try {
		const product = await productService.deleteProduct(
			req.params.id,
			req.user.id
		);

		if (!product) {
			return sendError(res, {
				statusCode: StatusCodes.NOT_FOUND,
				code: "PRODUCT.NOT_FOUND",
				details: { id: req.params.id },
				message: "Product not found",
			});
		}

		return sendSuccess(res, {
			statusCode: StatusCodes.OK,
			data: product,
			message: "Product deleted successfully",
		});
	} catch (error) {
		if (error.message.includes("Unauthorized")) {
			return sendError(res, {
				statusCode: StatusCodes.FORBIDDEN,
				code: "PRODUCT.UNAUTHORIZED",
				details: { message: error.message },
				message: error.message,
			});
		}

		return sendError(res, {
			statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
			code: "PRODUCT.DELETE_FAILED",
			details: { message: error.message },
			message: "Failed to delete product",
		});
	}
};

// List Products
export const listProducts = async (req, res) => {
	try {
		const result = await productService.listProducts(req.query);

		return sendSuccess(res, {
			statusCode: StatusCodes.OK,
			data: result.products,
			pagination: result.pagination,
			message: "Products retrieved successfully",
		});
	} catch (error) {
		return sendError(res, {
			statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
			code: "PRODUCT.LIST_FAILED",
			details: { message: error.message },
			message: "Failed to list products",
		});
	}
};

// Upload Product Images
export const uploadProductImages = async (req, res) => {
	try {
		const product = await productService.uploadImages(
			req.params.id,
			req.body.images,
			req.user.id
		);

		if (!product) {
			return sendError(res, {
				statusCode: StatusCodes.NOT_FOUND,
				code: "PRODUCT.NOT_FOUND",
				details: { id: req.params.id },
				message: "Product not found",
			});
		}

		return sendSuccess(res, {
			statusCode: StatusCodes.OK,
			data: product,
			message: "Images uploaded successfully",
		});
	} catch (error) {
		if (error.message.includes("Unauthorized")) {
			return sendError(res, {
				statusCode: StatusCodes.FORBIDDEN,
				code: "PRODUCT.UNAUTHORIZED",
				details: { message: error.message },
				message: error.message,
			});
		}

		return sendError(res, {
			statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
			code: "PRODUCT.UPLOAD_FAILED",
			details: { message: error.message },
			message: "Failed to upload images",
		});
	}
};
