import { Router } from "express";
import * as productController from "./products.controller.js";
import { isSeller } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";

import {
	productCreateSchema,
	productUpdateSchema,
	productIdSchema,
	productQuerySchema,
	imageUploadSchema,
} from "./products.validation.js";

const router = Router();

/**
 * createProductRoute
 * POST /api/products
 * Access: Seller
 */
export const createProductRoute = router.post(
	"/products",
	isSeller,
	validate(productCreateSchema),
	productController.createProduct
);

/**
 * getProductRoute
 * GET /api/products/:id
 * Access: Public
 */
export const getProductRoute = router.get(
	"/products/:id",
	validate(productIdSchema, "params"),
	productController.getProductById
);

/**
 * updateProductRoute
 * PUT /api/products/:id
 * Access: Seller
 */
export const updateProductRoute = router.put(
	"/products/:id",
	isSeller,
	validate(productIdSchema, "params"),
	validate(productUpdateSchema),
	productController.updateProduct
);

/**
 * deleteProductRoute
 * DELETE /api/products/:id
 * Access: Seller
 */
export const deleteProductRoute = router.delete(
	"/products/:id",
	isSeller,
	validate(productIdSchema, "params"),
	productController.deleteProduct
);

/**
 * listProductsRoute
 * GET /api/products
 * Access: Public
 */
export const listProductsRoute = router.get(
	"/products",
	validate(productQuerySchema, "query"),
	productController.listProducts
);

/**
 * uploadImagesRoute
 * POST /api/products/:id/images/upload
 * Access: Seller
 */
export const uploadImagesRoute = router.post(
	"/products/:id/images/upload",
	isSeller,
	validate(productIdSchema, "params"),
	validate(imageUploadSchema),
	productController.uploadProductImages
);

export default router;
