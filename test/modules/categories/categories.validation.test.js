import { describe, expect, it } from "vitest";
import {
	categoryCreateSchema,
	categoryIdSchema,
	categoryUpdateSchema,
} from "../../../src/modules/categories/categories.validation.js";

describe("Categories Validation Schemas", () => {
	describe("categoryCreateSchema", () => {
		it("should validate a correct category object", () => {
			const data = { name: "Electronics", description: "All kinds of gadgets" };
			const result = categoryCreateSchema.safeParse(data);
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.name).toBe("Electronics");
			}
		});

		it("should trim category name and description", () => {
			const data = { name: "  Electronics  ", description: "  Gadgets  " };
			const result = categoryCreateSchema.safeParse(data);
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.name).toBe("Electronics");
				expect(result.data.description).toBe("Gadgets");
			}
		});

		it("should fail if name is missing", () => {
			const data = { description: "Gadgets" };
			const result = categoryCreateSchema.safeParse(data);
			expect(result.success).toBe(false);
		});

		it("should fail if name is too short (< 3 chars)", () => {
			const data = { name: "El" };
			const result = categoryCreateSchema.safeParse(data);
			expect(result.success).toBe(false);
		});

		it("should fail if name is too long (> 32 chars)", () => {
			const data = { name: "A".repeat(33) };
			const result = categoryCreateSchema.safeParse(data);
			expect(result.success).toBe(false);
		});

		it("should fail if description is too long (> 250 chars)", () => {
			const data = { name: "Electronics", description: "A".repeat(251) };
			const result = categoryCreateSchema.safeParse(data);
			expect(result.success).toBe(false);
		});

		it("should allow missing description", () => {
			const data = { name: "Electronics" };
			const result = categoryCreateSchema.safeParse(data);
			expect(result.success).toBe(true);
		});
	});

	describe("categoryUpdateSchema", () => {
		it("should allow partial updates (name only)", () => {
			const data = { name: "New Name" };
			const result = categoryUpdateSchema.safeParse(data);
			expect(result.success).toBe(true);
		});

		it("should allow partial updates (description only)", () => {
			const data = { description: "New Description" };
			const result = categoryUpdateSchema.safeParse(data);
			expect(result.success).toBe(true);
		});

		it("should allow empty updates", () => {
			const data = {};
			const result = categoryUpdateSchema.safeParse(data);
			expect(result.success).toBe(true);
		});

		it("should fail if name is too short", () => {
			const data = { name: "ab" };
			const result = categoryUpdateSchema.safeParse(data);
			expect(result.success).toBe(false);
		});
	});

	describe("categoryIdSchema", () => {
		it("should validate a correct MongoDB ObjectId", () => {
			const data = { id: "507f1f77bcf86cd799439011" };
			const result = categoryIdSchema.safeParse(data);
			expect(result.success).toBe(true);
		});

		it("should fail on invalid ObjectId string", () => {
			const data = { id: "invalid-id" };
			const result = categoryIdSchema.safeParse(data);
			expect(result.success).toBe(false);
		});

		it("should fail on empty ID", () => {
			const data = { id: "" };
			const result = categoryIdSchema.safeParse(data);
			expect(result.success).toBe(false);
		});
	});
});
