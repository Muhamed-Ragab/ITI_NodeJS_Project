import mongoose from "mongoose";
import { z } from "zod";

const objectId = z
	.string()
	.refine((value) => mongoose.Types.ObjectId.isValid(value), {
		message: "Invalid ID format",
	});

export const reviewCreateSchema = z.object({
	product_id: objectId,
	rating: z.number().int().min(1).max(5),
	comment: z.string().trim().max(1000).optional(),
});

export const reviewUpdateSchema = z
	.object({
		rating: z.number().int().min(1).max(5).optional(),
		comment: z.string().trim().max(1000).optional(),
	})
	.refine(
		(value) => value.rating !== undefined || value.comment !== undefined,
		{
			message: "At least one field is required",
		}
	);

export const reviewIdSchema = z.object({
	id: objectId,
});

export const productIdSchema = z.object({
	productId: objectId,
});

export const productReviewsQuerySchema = z.object({
	page: z.string().optional(),
	limit: z.string().optional(),
});
