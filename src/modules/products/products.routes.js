import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { requireRole } from "../../middlewares/role.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import * as productController from "./products.controller.js";

import {
	imageUploadPayloadSchema,
	imageUploadSchema,
	productCreateSchema,
	productIdSchema,
	productQuerySchema,
	productUpdateSchema,
} from "./products.validation.js";

const productsRouter = Router();

productsRouter
	.get(
		"/",
		validate({ query: productQuerySchema }),
		productController.listProducts
	)
	.post(
		"/",
		requireAuth,
		requireRole("seller"),
		validate({ body: productCreateSchema }),
		productController.createProduct
	)
	.get(
		"/:id",
		validate({ params: productIdSchema }),
		productController.getProductById
	)
	.put(
		"/admin/:id",
		requireAuth,
		requireRole("admin"),
		validate({ params: productIdSchema, body: productUpdateSchema }),
		productController.adminUpdateProduct
	)
	.delete(
		"/admin/:id",
		requireAuth,
		requireRole("admin"),
		validate({ params: productIdSchema }),
		productController.adminDeleteProduct
	)
	.put(
		"/:id",
		requireAuth,
		requireRole("seller"),
		validate({ params: productIdSchema, body: productUpdateSchema }),
		productController.updateProduct
	)
	.delete(
		"/:id",
		requireAuth,
		requireRole("seller"),
		validate({ params: productIdSchema }),
		productController.deleteProduct
	)
	.post(
		"/images/upload-payload",
		requireAuth,
		requireRole("seller"),
		validate({ body: imageUploadPayloadSchema }),
		productController.getProductImageUploadPayload
	)
	.post(
		"/:id/images/upload",
		requireAuth,
		requireRole("seller"),
		validate({ params: productIdSchema, body: imageUploadSchema }),
		productController.uploadProductImages
	);

export default productsRouter;
