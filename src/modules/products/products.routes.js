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

router
	.route("/")
	.get(validate({ query: productQuerySchema }), productController.listProducts)
	.post(
		requireAuth,
		requireRole("seller"),
		validate({ body: productCreateSchema }),
		productController.createProduct
	);

router
	.route("/:id")
	.get(validate({ params: productIdSchema }), productController.getProductById)
	.put(
		requireAuth,
		requireRole("seller"),
		validate({ params: productIdSchema, body: productUpdateSchema }),
		productController.updateProduct
	)
	.delete(
		requireAuth,
		requireRole("seller"),
		validate({ params: productIdSchema }),
		productController.deleteProduct
	);

router.post(
	"/images/upload-payload",
	requireAuth,
	requireRole("seller"),
	validate({ body: imageUploadPayloadSchema }),
	productController.getProductImageUploadPayload
);

router.post(
	"/:id/images/upload",
	requireAuth,
	requireRole("seller"),
	validate({ params: productIdSchema, body: imageUploadSchema }),
	productController.uploadProductImages
);

export default router;
