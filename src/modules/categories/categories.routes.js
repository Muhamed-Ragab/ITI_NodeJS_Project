import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { requireRole } from "../../middlewares/role.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import * as categoryController from "./categories.controller.js";
import {
	categoryCreateSchema,
	categoryIdSchema,
	categoryUpdateSchema,
} from "./categories.validation.js";

const categoryRouter = Router();

categoryRouter
	.route("/")
	.get(categoryController.listCategories)
	.post(
		requireAuth,
		requireRole("admin"),
		validate({ body: categoryCreateSchema }),
		categoryController.createCategory
	);

categoryRouter
	.route("/:id")
	.get(
		validate({ params: categoryIdSchema }),
		categoryController.getCategoryById
	)
	.put(
		requireAuth,
		requireRole("admin"),
		validate({ params: categoryIdSchema, body: categoryUpdateSchema }),
		categoryController.updateCategory
	)
	.delete(
		requireAuth,
		requireRole("admin"),
		validate({ params: categoryIdSchema }),
		categoryController.deleteCategory
	);

categoryRouter.route("/products").get(categoryController.getProductsByCategory);

export default categoryRouter;
