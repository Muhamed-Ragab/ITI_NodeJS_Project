import mongoose from "mongoose";
import { z } from "zod";

const objectId = z
	.string()
	.refine((value) => mongoose.Types.ObjectId.isValid(value), {
		message: "Invalid ID format",
	});

export const contentCreateSchema = z.object({
	section: z.enum(["homepage", "banner"]),
	title: z.string().trim().min(2).max(120),
	slug: z
		.string()
		.trim()
		.min(2)
		.max(120)
		.regex(/^[a-z0-9-]+$/),
	body: z.string().trim().max(5000).optional(),
	image_url: z.string().trim().url().optional(),
	is_active: z.boolean().optional(),
	starts_at: z.string().datetime().optional(),
	ends_at: z.string().datetime().optional(),
});

export const contentUpdateSchema = contentCreateSchema
	.partial()
	.refine((value) => Object.keys(value).length > 0, {
		message: "At least one field is required",
	});

export const contentIdSchema = z.object({
	id: objectId,
});

export const contentListQuerySchema = z.object({
	section: z.enum(["homepage", "banner"]).optional(),
	is_active: z.union([z.literal("true"), z.literal("false")]).optional(),
});
