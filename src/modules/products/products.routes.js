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

const router = Router();

export const createProductRoute = router.post(
	"/",
	requireAuth,
	requireRole("seller"),
	validate({ body: productCreateSchema }),
	productController.createProduct
);

export const getProductRoute = router.get(
	"/:id",
	validate({ params: productIdSchema }),
	productController.getProductById
);

export const updateProductRoute = router.put(
	"/:id",
	requireAuth,
	requireRole("seller"),
	validate({ params: productIdSchema, body: productUpdateSchema }),
	productController.updateProduct
);

export const deleteProductRoute = router.delete(
	"/:id",
	requireAuth,
	requireRole("seller"),
	validate({ params: productIdSchema }),
	productController.deleteProduct
);

export const listProductsRoute = router.get(
	"/",
	validate({ query: productQuerySchema }),
	productController.listProducts
);

export const getImageUploadPayloadRoute = router.post(
	"/images/upload-payload",
	requireAuth,
	requireRole("seller"),
	validate({ body: imageUploadPayloadSchema }),
	productController.getProductImageUploadPayload
);

export const uploadImagesRoute = router.post(
	"/:id/images/upload",
	requireAuth,
	requireRole("seller"),
	validate({ params: productIdSchema, body: imageUploadSchema }),
	productController.uploadProductImages
);

export default router;
