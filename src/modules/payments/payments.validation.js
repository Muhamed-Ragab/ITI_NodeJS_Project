import mongoose from "mongoose";
import { z } from "zod";

const objectId = z
	.string()
	.refine((value) => mongoose.Types.ObjectId.isValid(value), {
		message: "Invalid ID format",
	});

export const paymentCheckoutSchema = z.object({
	orderId: objectId,
	method: z.enum(["stripe", "paypal", "cod", "wallet"]),
	savedMethodId: objectId.optional(),
});

export const guestPaymentCheckoutSchema = z.object({
	orderId: objectId,
	guestEmail: z.email("Invalid email format"),
	method: z.enum(["stripe", "paypal", "cod"]),
});

export const paymentsAdminQuerySchema = z
	.object({
		status: z.string(),
		page: z.string(),
		limit: z.string(),
	})
	.optional();
