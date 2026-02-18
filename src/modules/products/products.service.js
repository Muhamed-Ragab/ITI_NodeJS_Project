import * as productRepository from "./products.repository.js";

// Create Product
export const createProduct = async (productData, sellerId) => {
	try {
		return await productRepository.create({
			...productData,
			seller_id: sellerId,
		});
	} catch (error) {
		if (error.code === 11000) {
			throw new Error("Product already exists");
		}
		throw error;
	}
};

// Get Product By ID
export const getProductById = async (id) => {
	return await productRepository.findById(id);
};

// Update Product
export const updateProduct = async (id, productData, sellerId) => {
	const product = await productRepository.findById(id);

	if (!product) {
		return null;
	}

	// Check if seller owns the product
	if (product.seller_id._id.toString() !== sellerId.toString()) {
		throw new Error("Unauthorized: You can only update your own products");
	}

	try {
		return await productRepository.updateById(id, productData);
	} catch (error) {
		if (error.code === 11000) {
			throw new Error("Product already exists");
		}
		throw error;
	}
};

// Delete Product
export const deleteProduct = async (id, sellerId) => {
	const product = await productRepository.findById(id);

	if (!product) {
		return null;
	}

	// Check if seller owns the product
	if (product.seller_id._id.toString() !== sellerId.toString()) {
		throw new Error("Unauthorized: You can only delete your own products");
	}

	return await productRepository.deleteById(id);
};

// List Products
export const listProducts = async (filters) => {
	return await productRepository.listWithFilters(filters);
};

// Upload Images
export const uploadImages = async (id, images, sellerId) => {
	const product = await productRepository.findById(id);

	if (!product) {
		return null;
	}

	// Check if seller owns the product
	if (product.seller_id._id.toString() !== sellerId.toString()) {
		throw new Error(
			"Unauthorized: You can only upload images to your own products"
		);
	}

	return await productRepository.appendImages(id, images);
};
