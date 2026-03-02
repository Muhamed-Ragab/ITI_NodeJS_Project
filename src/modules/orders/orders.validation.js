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
	couponCode: z.string().trim().min(3).max(32).optional(),
	paymentMethod: z.enum(["stripe", "paypal", "cod", "wallet"]).optional(),
});

export const guestOrderCreateSchema = z.object({
	guest_info: z.object({
		name: z.string().trim().min(2).max(100),
		email: z.string().trim().toLowerCase().email(),
		phone: z.string().trim().min(8).max(20).optional(),
	}),
	shipping_address: z
		.object({
			street: z.string().trim().min(2).max(120),
			city: z.string().trim().min(2).max(60),
			country: z.string().trim().min(2).max(60),
			zip: z.string().trim().min(2).max(20),
		})
		.optional(),
	items: z
		.array(
			z.object({
				product: objectId,
				quantity: z.number().int().positive(),
			})
		)
		.min(1),
	couponCode: z.string().trim().min(3).max(32).optional(),
	paymentMethod: z.enum(["stripe", "paypal", "cod", "wallet"]).optional(),
});

export const orderIdSchema = z.object({
	id: objectId,
});

export const orderStatusSchema = z.object({
	status: z.enum(["pending", "paid", "shipped", "delivered", "cancelled"]),
});

export const sellerOrderStatusSchema = z.object({
	status: z.enum(["shipped", "delivered", "cancelled"]),
});
