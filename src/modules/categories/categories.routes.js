import { Router } from "express";
import * as categoryController from "./categories.controller.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
//import { isAdmin } from "../../middlewares/auth.middleware.js";
//import { validate } from "../../middlewares/validate.middleware.js";

import {
    categoryCreateSchema,
    categoryUpdateSchema,
    categoryIdSchema
} from "./categories.validation.js";

const router = Router();

/**
 * createCategoryRoute
 * POST /api/categories
 * Access: Admin
 */
export const createCategoryRoute = router.post(
    "/categories",
    //isAdmin,
    //validate(categoryCreateSchema),
    asyncHandler(categoryController.createCategory)
);

/**
 * getCategoryRoute
 * GET /api/categories/:id
 * Access: Public
 */
export const getCategoryRoute = router.get(
    "/categories/:id",
   // validate(categoryIdSchema, "params"),
    asyncHandler(categoryController.getCategoryById)
);

/**
 * updateCategoryRoute
 * PUT /api/categories/:id
 * Access: Admin
 */
export const updateCategoryRoute = router.put(
    "/categories/:id",
   // isAdmin,
    //validate(categoryIdSchema, "params"),
    //validate(categoryUpdateSchema),
    asyncHandler(categoryController.updateCategory)
);

/**
 * deleteCategoryRoute
 * DELETE /api/categories/:id
 * Access: Admin
 */
export const deleteCategoryRoute = router.delete(
    "/categories/:id",
    //isAdmin,
    //validate(categoryIdSchema, "params"),
    asyncHandler(categoryController.deleteCategory)
);

/**
 * listCategoriesRoute
 * GET /api/categories
 * Access: Public
 */
export const listCategoriesRoute = router.get(
    "/categories",
    asyncHandler(categoryController.listCategories)
);

export default router;

    