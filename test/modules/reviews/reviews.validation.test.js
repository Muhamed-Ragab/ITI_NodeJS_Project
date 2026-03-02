import { describe, expect, it } from "vitest";
import {
	productIdSchema,
	productReviewsQuerySchema,
	reviewCreateSchema,
	reviewIdSchema,
	reviewUpdateSchema,
} from "../../../src/modules/reviews/reviews.validation.js";

describe("Reviews Validation", () => {
	describe("reviewCreateSchema", () => {
		it("should validate a valid review payload", () => {
			const result = reviewCreateSchema.safeParse({
				product_id: "507f1f77bcf86cd799439011",
				rating: 5,
				comment: "Great product",
			});

			expect(result.success).toBe(true);
		});

		it("should fail when rating is out of range", () => {
			const result = reviewCreateSchema.safeParse({
				product_id: "507f1f77bcf86cd799439011",
				rating: 6,
			});

			expect(result.success).toBe(false);
		});
	});

	describe("reviewUpdateSchema", () => {
		it("should validate when rating is provided", () => {
			const result = reviewUpdateSchema.safeParse({ rating: 4 });
			expect(result.success).toBe(true);
		});

		it("should fail when payload is empty", () => {
			const result = reviewUpdateSchema.safeParse({});
			expect(result.success).toBe(false);
		});
	});

	describe("reviewIdSchema", () => {
		it("should validate a valid review id", () => {
			const result = reviewIdSchema.safeParse({
				id: "507f1f77bcf86cd799439011",
			});

			expect(result.success).toBe(true);
		});
	});

	describe("productIdSchema", () => {
		it("should validate a valid product id", () => {
			const result = productIdSchema.safeParse({
				productId: "507f1f77bcf86cd799439011",
			});

			expect(result.success).toBe(true);
		});
	});

	describe("productReviewsQuerySchema", () => {
		it("should allow pagination query values", () => {
			const result = productReviewsQuerySchema.safeParse({
				page: "1",
				limit: "20",
			});

			expect(result.success).toBe(true);
		});
	});
});
