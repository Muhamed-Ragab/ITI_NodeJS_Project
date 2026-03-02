import { describe, expect, it } from "vitest";
import {
	emailLoginSchema,
	emailRequestOtpSchema,
	loginSchema,
	registerSchema,
	verifyEmailSchema,
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

	describe("emailRequestOtpSchema", () => {
		it("should validate a correct email", () => {
			const result = emailRequestOtpSchema.safeParse({
				email: "test@example.com",
			});
			expect(result.success).toBe(true);
		});

		it("should fail for invalid email", () => {
			const result = emailRequestOtpSchema.safeParse({ email: "bad" });
			expect(result.success).toBe(false);
		});
	});

	describe("emailLoginSchema", () => {
		it("should validate email + otp", () => {
			const result = emailLoginSchema.safeParse({
				email: "test@example.com",
				otp: "123456",
			});
			expect(result.success).toBe(true);
		});

		it("should fail for invalid otp", () => {
			const result = emailLoginSchema.safeParse({
				email: "test@example.com",
				otp: "12",
			});
			expect(result.success).toBe(false);
		});
	});

	describe("verifyEmailSchema", () => {
		it("should validate a token", () => {
			const result = verifyEmailSchema.safeParse({ token: "abc123" });
			expect(result.success).toBe(true);
		});

		it("should fail for empty token", () => {
			const result = verifyEmailSchema.safeParse({ token: "" });
			expect(result.success).toBe(false);
		});
	});
});
