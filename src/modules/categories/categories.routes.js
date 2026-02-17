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

const router = Router();

/**
 * createCategoryRoute
 * POST /api/categories
 * Access: Admin
 */
export const createCategoryRoute = router.post(
	"/categories",
	requireAuth,
	requireRole("admin"),
	validate({ body: categoryCreateSchema }),
	categoryController.createCategory
);

/**
 * getCategoryRoute
 * GET /api/categories/:id
 * Access: Public
 */
export const getCategoryRoute = router.get(
	"/categories/:id",
	validate({ params: categoryIdSchema }),
	categoryController.getCategoryById
);

/**
 * updateCategoryRoute
 * PUT /api/categories/:id
 * Access: Admin
 */
export const updateCategoryRoute = router.put(
	"/categories/:id",
	requireAuth,
	requireRole("admin"),
	validate({ params: categoryIdSchema, body: categoryUpdateSchema }),
	categoryController.updateCategory
);

/**
 * deleteCategoryRoute
 * DELETE /api/categories/:id
 * Access: Admin
 */
export const deleteCategoryRoute = router.delete(
	"/categories/:id",
	requireAuth,
	requireRole("admin"),
	validate({ params: categoryIdSchema }),
	categoryController.deleteCategory
);

/**
 * listCategoriesRoute
 * GET /api/categories
 * Access: Public
 */
export const listCategoriesRoute = router.get(
	"/categories",
	categoryController.listCategories
);

export default router;
