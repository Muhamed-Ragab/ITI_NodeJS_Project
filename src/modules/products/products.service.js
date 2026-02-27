import { createCdnProvider } from "../../services/cdn/index.js";
import { ApiError } from "../../utils/errors/api-error.js";
import * as productRepository from "./products.repository.js";

const cdnProvider = createCdnProvider("cloudinary");

export const createProduct = async (productData, sellerId) => {
	try {
		return await productRepository.create({
			...productData,
			seller_id: sellerId,
		});
	} catch (error) {
		if (error.code === 11_000) {
			throw ApiError.badRequest({
				code: "PRODUCT.DUPLICATE",
				message: "Product with this title already exists",
			});
		}

		throw error;
	}
};

export const getProductById = async (id) => {
	const product = await productRepository.findById(id);

	if (!product) {
		throw ApiError.notFound({
			code: "PRODUCT.NOT_FOUND",
			message: "Product not found",
			details: { id },
		});
	}

	return product;
};

export const updateProduct = async (id, productData, sellerId) => {
	const product = await productRepository.findById(id);

	if (!product) {
		throw ApiError.notFound({
			code: "PRODUCT.NOT_FOUND",
			message: "Product not found",
			details: { id },
		});
	}

	if (product.seller_id._id.toString() !== sellerId.toString()) {
		throw ApiError.forbidden({
			code: "PRODUCT.UNAUTHORIZED",
			message: "You can only update your own products",
		});
	}

	return await productRepository.updateById(id, productData);
};

export const adminUpdateProduct = async (id, productData) => {
	const product = await productRepository.findById(id);

	if (!product) {
		throw ApiError.notFound({
			code: "PRODUCT.NOT_FOUND",
			message: "Product not found",
			details: { id },
		});
	}

	return await productRepository.updateById(id, productData);
};

export const deleteProduct = async (id, sellerId) => {
	const product = await productRepository.findById(id);

	if (!product) {
		throw ApiError.notFound({
			code: "PRODUCT.NOT_FOUND",
			message: "Product not found",
			details: { id },
		});
	}

	if (product.seller_id._id.toString() !== sellerId.toString()) {
		throw ApiError.forbidden({
			code: "PRODUCT.UNAUTHORIZED",
			message: "You can only delete your own products",
		});
	}

	return await productRepository.deleteById(id);
};

export const adminDeleteProduct = async (id) => {
	const product = await productRepository.findById(id);

	if (!product) {
		throw ApiError.notFound({
			code: "PRODUCT.NOT_FOUND",
			message: "Product not found",
			details: { id },
		});
	}

	return await productRepository.deleteById(id);
};

export const listProducts = async (filters) => {
	return await productRepository.listWithFilters(filters);
};

export const uploadImages = async (id, images, sellerId) => {
	const product = await productRepository.findById(id);

	if (!product) {
		throw ApiError.notFound({
			code: "PRODUCT.NOT_FOUND",
			message: "Product not found",
			details: { id },
		});
	}

	if (product.seller_id._id.toString() !== sellerId.toString()) {
		throw ApiError.forbidden({
			code: "PRODUCT.UNAUTHORIZED",
			message: "You can only upload images to your own products",
		});
	}

	const uploadedImages = await cdnProvider.uploadMany(images, {
		folder: "products",
	});

	return await productRepository.appendImages(id, uploadedImages);
};

export const getImageUploadPayload = (sellerId, options = {}) => {
	if (!sellerId) {
		throw ApiError.unauthorized({
			code: "PRODUCT.UNAUTHORIZED",
			message: "Authentication is required",
		});
	}

	return cdnProvider.getUploadRequestPayload({
		folder: options.folder ?? "products",
	});
};

export const getBestSellers = async (limit = 10) => {
	return await productRepository.getBestSellers(limit);
};

export const getRelatedProducts = async (productId, limit = 6) => {
	const product = await productRepository.findById(productId);

	if (!product) {
		throw ApiError.notFound({
			code: "PRODUCT.NOT_FOUND",
			message: "Product not found",
			details: { id: productId },
		});
	}

	return await productRepository.getRelatedProducts(productId, limit);
};
