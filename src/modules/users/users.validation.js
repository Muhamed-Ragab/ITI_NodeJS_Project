import mongoose from "mongoose";
import { z } from "zod";

const objectId = z
	.string()
	.refine((value) => mongoose.Types.ObjectId.isValid(value), {
		message: "Invalid ID format",
	});

export const addressSchema = z.object({
	street: z.string().trim().min(2).max(100).optional(),
	city: z.string().trim().min(2).max(50).optional(),
	country: z.string().trim().min(2).max(50).optional(),
	zip: z.string().trim().min(2).max(20).optional(),
});

export const profileUpdateSchema = z.object({
	name: z.string().trim().min(2).max(50).optional(),
	password: z.string().min(6).max(128).optional(),
});

export const productIdSchema = z.object({
	productId: objectId,
});

export const cartItemSchema = z.object({
	product: objectId,
	quantity: z.number().int().positive().default(1),
});

export const roleUpdateSchema = z.object({
	role: z.enum(["member", "admin"]),
});

export const userIdSchema = z.object({
	id: objectId,
});

export const addressIdSchema = z.object({
	addressId: objectId,
});
