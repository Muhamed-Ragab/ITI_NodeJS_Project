import mongoose from "mongoose";
import { z } from "zod";

const objectId = z
	.string()
	.refine((value) => mongoose.Types.ObjectId.isValid(value), {
		message: "Invalid category id",
	});

export const categoryCreateSchema = z.object({
	name: z.string().trim().min(3).max(32),

	description: z.string().trim().max(250).optional(),
});

export const categoryUpdateSchema = z.object({
	name: z.string().trim().min(3).max(32).optional(),

	description: z.string().trim().max(250).optional(),
});

export const categoryIdSchema = z.object({
	id: objectId,
});
