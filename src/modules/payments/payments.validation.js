import mongoose from "mongoose";
import { z } from "zod";

const objectId = z
	.string()
	.refine((value) => mongoose.Types.ObjectId.isValid(value), {
		message: "Invalid ID format",
	});

export const paymentIntentSchema = z.object({
	orderId: objectId,
});

export const paymentsAdminQuerySchema = z.object({
	status: z.string().optional(),
	page: z.string().optional(),
	limit: z.string().optional(),
});
