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
	phone: z
		.string()
		.trim()
		.regex(/^\+?[1-9]\d{7,14}$/, "Invalid phone number format")
		.optional(),
});

export const productIdSchema = z.object({
	productId: objectId,
});

export const cartItemSchema = z.object({
	product: objectId,
	quantity: z.number().int().positive().default(1),
});

export const roleUpdateSchema = z.object({
	role: z.enum(["customer", "seller", "admin"]),
});

export const restrictionUpdateSchema = z.object({
	isRestricted: z.boolean(),
});

export const userIdSchema = z.object({
	id: objectId,
});

export const addressIdSchema = z.object({
	addressId: objectId,
});

export const savedPaymentMethodCreateSchema = z.object({
	provider: z.enum(["stripe", "paypal", "card"]),
	provider_token: z.string().trim().min(4).max(255),
	brand: z.string().trim().min(2).max(32).optional(),
	last4: z
		.string()
		.trim()
		.regex(/^\d{4}$/)
		.optional(),
	expiry_month: z.number().int().min(1).max(12).optional(),
	expiry_year: z.number().int().min(2024).max(2100).optional(),
	isDefault: z.boolean().optional(),
});

export const savedPaymentMethodIdSchema = z.object({
	methodId: objectId,
});

export const sellerOnboardingRequestSchema = z.object({
	store_name: z.string().trim().min(2).max(100),
	bio: z.string().trim().min(10).max(500).optional(),
	payout_method: z.string().trim().min(2).max(50),
});

export const sellerApprovalSchema = z.object({
	status: z.enum(["approved", "rejected"]),
	note: z.string().trim().max(300).optional(),
});

export const payoutRequestCreateSchema = z.object({
	amount: z.number().positive(),
	note: z.string().trim().max(300).optional(),
});

export const payoutRequestIdSchema = z.object({
	payoutId: objectId,
});

export const payoutReviewSchema = z.object({
	status: z.enum(["approved", "rejected", "paid"]),
	note: z.string().trim().max(300).optional(),
});

export const marketingPreferencesSchema = z
	.object({
		push_notifications: z.boolean().optional(),
		email_newsletter: z.boolean().optional(),
		promotional_notifications: z.boolean().optional(),
	})
	.refine((value) => Object.keys(value).length > 0, {
		message: "At least one marketing preference is required",
	});

export const preferredLanguageSchema = z.object({
	language: z.enum(["en", "ar", "fr"]),
});

export const referralApplySchema = z.object({
	code: z
		.string()
		.trim()
		.min(4)
		.max(32)
		.regex(/^[A-Z0-9-]+$/),
});

export const loyaltyGrantSchema = z.object({
	points: z.number().int().min(1).max(10_000),
	reason: z.string().trim().min(3).max(200).optional(),
});

export const marketingBroadcastSchema = z.object({
	channel: z.enum(["email", "push", "promotional"]),
	title: z.string().trim().min(3).max(120),
	body: z.string().trim().min(5).max(1000),
});
