import { describe, expect, it } from "vitest";
import {
	couponCreateSchema,
	couponValidateSchema,
} from "../../../src/modules/coupons/coupons.validation.js";

describe("Coupons Validation", () => {
	it("validates create payload", () => {
		const result = couponCreateSchema.safeParse({
			code: "SAVE10",
			type: "percentage",
			value: 10,
			per_user_limit: 1,
		});

		expect(result.success).toBe(true);
	});

	it("fails when create payload is invalid", () => {
		const result = couponCreateSchema.safeParse({
			code: "A",
			type: "percentage",
			value: -5,
		});

		expect(result.success).toBe(false);
	});

	it("validates coupon order-check payload", () => {
		const result = couponValidateSchema.safeParse({
			code: "SAVE10",
			subtotal_amount: 200,
		});

		expect(result.success).toBe(true);
	});
});
