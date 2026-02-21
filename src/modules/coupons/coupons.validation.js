import mongoose from "mongoose";
import { z } from "zod";

const objectId = z
	.string()
	.refine((value) => mongoose.Types.ObjectId.isValid(value), {
		message: "Invalid ID format",
	});

const optionalDate = z
	.string()
	.datetime()
	.transform((value) => new Date(value))
	.optional();

export const couponCreateSchema = z.object({
	code: z.string().trim().min(3).max(32),
	type: z.enum(["percentage", "fixed"]),
	value: z.number().min(0),
	is_active: z.boolean().optional(),
	starts_at: optionalDate,
	ends_at: optionalDate,
	min_order_amount: z.number().min(0).optional(),
	usage_limit: z.number().int().min(1).nullable().optional(),
	per_user_limit: z.number().int().min(1).optional(),
});

export const couponUpdateSchema = z
	.object({
		code: z.string().trim().min(3).max(32).optional(),
		type: z.enum(["percentage", "fixed"]).optional(),
		value: z.number().min(0).optional(),
		is_active: z.boolean().optional(),
		starts_at: optionalDate,
		ends_at: optionalDate,
		min_order_amount: z.number().min(0).optional(),
		usage_limit: z.number().int().min(1).nullable().optional(),
		per_user_limit: z.number().int().min(1).optional(),
	})
	.refine((value) => Object.keys(value).length > 0, {
		message: "At least one field is required",
	});

export const couponIdSchema = z.object({
	id: objectId,
});

export const couponListQuerySchema = z.object({
	page: z.string().optional(),
	limit: z.string().optional(),
	is_active: z.string().optional(),
	code: z.string().optional(),
});

export const couponValidateSchema = z.object({
	code: z.string().trim().min(3).max(32),
	subtotal_amount: z.number().min(0),
});
