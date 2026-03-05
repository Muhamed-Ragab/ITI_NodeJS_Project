import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import {
	createReview,
	deleteReview,
	getReviewById,
	listProductReviews,
	updateReview,
} from "./reviews.controller.js";
import {
	productIdSchema,
	productReviewsQuerySchema,
	reviewCreateSchema,
	reviewIdSchema,
	reviewUpdateSchema,
} from "./reviews.validation.js";

const reviewsRouter = Router();

reviewsRouter.post(
	"/",
	requireAuth,
	validate({ body: reviewCreateSchema }),
	createReview
);

reviewsRouter.get(
	"/product/:productId",
	validate({ params: productIdSchema, query: productReviewsQuerySchema }),
	listProductReviews
);

reviewsRouter.get("/:id", validate({ params: reviewIdSchema }), getReviewById);

reviewsRouter.put(
	"/:id",
	requireAuth,
	validate({ params: reviewIdSchema, body: reviewUpdateSchema }),
	updateReview
);

reviewsRouter.delete(
	"/:id",
	requireAuth,
	validate({ params: reviewIdSchema }),
	deleteReview
);

export default reviewsRouter;
