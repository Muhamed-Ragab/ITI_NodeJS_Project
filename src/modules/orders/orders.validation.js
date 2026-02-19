import mongoose from "mongoose";
import { z } from "zod";

const objectId = z
	.string()
	.refine((value) => mongoose.Types.ObjectId.isValid(value), {
		message: "Invalid ID format",
	});

/** Optional body for create order (e.g. shipping address index) */
export const orderCreateSchema = z.object({
	shippingAddressIndex: z.number().int().min(0).optional(),
});

export const orderIdSchema = z.object({
	id: objectId,
});

export const orderStatusSchema = z.object({
	status: z.enum(["pending", "paid", "shipped", "delivered", "cancelled"]),
});
