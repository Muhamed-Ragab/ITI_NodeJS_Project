import { describe, expect, it } from "vitest";
import {
	cartItemSchema,
	marketingBroadcastSchema,
	marketingPreferencesSchema,
	preferredLanguageSchema,
	profileUpdateSchema,
	referralApplySchema,
} from "../../../src/modules/users/users.validation.js";

describe("Users Validation", () => {
	describe("profileUpdateSchema", () => {
		it("should allow optional fields", () => {
			const data = { name: "New Name" };
			const result = profileUpdateSchema.safeParse(data);
			expect(result.success).toBe(true);
		});
	});

	describe("cartItemSchema", () => {
		it("should validate correct cart item", () => {
			const data = { product: "507f1f77bcf86cd799439011", quantity: 2 };
			const result = cartItemSchema.safeParse(data);
			expect(result.success).toBe(true);
		});

		it("should fail for invalid productId", () => {
			const data = { product: "invalid", quantity: 2 };
			const result = cartItemSchema.safeParse(data);
			expect(result.success).toBe(false);
		});
	});

	describe("phase 4 schemas", () => {
		it("should validate marketing preferences payload", () => {
			const result = marketingPreferencesSchema.safeParse({
				email_newsletter: true,
			});
			expect(result.success).toBe(true);
		});

		it("should validate preferred language payload", () => {
			const result = preferredLanguageSchema.safeParse({ language: "ar" });
			expect(result.success).toBe(true);
		});

		it("should validate referral code payload", () => {
			const result = referralApplySchema.safeParse({ code: "REF-1234" });
			expect(result.success).toBe(true);
		});

		it("should validate marketing broadcast payload", () => {
			const result = marketingBroadcastSchema.safeParse({
				channel: "email",
				title: "Big Sale",
				body: "Up to 50% off",
			});
			expect(result.success).toBe(true);
		});
	});
});
