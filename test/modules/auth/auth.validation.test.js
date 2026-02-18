import { describe, expect, it } from "vitest";
import {
	loginSchema,
	registerSchema,
} from "../../../src/modules/auth/auth.validation.js";

describe("Auth Validation", () => {
	describe("registerSchema", () => {
		it("should validate a correct registration", () => {
			const data = {
				name: "Test User",
				email: "test@example.com",
				password: "password123",
			};
			const result = registerSchema.safeParse(data);
			expect(result.success).toBe(true);
		});

		it("should fail for invalid email", () => {
			const data = {
				name: "Test",
				email: "not-an-email",
				password: "password123",
			};
			const result = registerSchema.safeParse(data);
			expect(result.success).toBe(false);
		});

		it("should fail for short password", () => {
			const data = { name: "Test", email: "test@example.com", password: "123" };
			const result = registerSchema.safeParse(data);
			expect(result.success).toBe(false);
		});
	});

	describe("loginSchema", () => {
		it("should validate a correct login", () => {
			const data = { email: "test@example.com", password: "password123" };
			const result = loginSchema.safeParse(data);
			expect(result.success).toBe(true);
		});
	});
});
