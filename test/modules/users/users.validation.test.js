import { describe, expect, it } from "vitest";
import {
	cartItemSchema,
	profileUpdateSchema,
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
});
