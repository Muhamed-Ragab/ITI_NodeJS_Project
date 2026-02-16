import { z } from "zod";
import mongoose from "mongoose";

// Validate MongoDB ObjectId
const objectId = z
	.string()
	.refine((value) => mongoose.Types.ObjectId.isValid(value), {
		message: "Invalid category id",
	});

export const categoryCreateSchema = z.object({
	name: z.string().min(3).max(32),

	description: z.string().max(250).optional(),
});

export const categoryUpdateSchema = z.object({
	name: z.string().min(3).max(32).optional(),

	description: z.string().max(250).optional(),
});

export const categoryIdSchema = z.object({
	id: objectId,
});
