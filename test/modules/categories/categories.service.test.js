import { beforeEach, describe, expect, it, vi } from "vitest";
import * as categoryRepository from "../../../src/modules/categories/categories.repository.js";
import * as categoryService from "../../../src/modules/categories/categories.service.js";

vi.mock("../../../src/modules/categories/categories.repository.js", () => ({
	create: vi.fn(),
	findById: vi.fn(),
	updateById: vi.fn(),
	deleteById: vi.fn(),
	list: vi.fn(),
}));

describe("Categories Service", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("createCategory", () => {
		it("should generate a slug and call repository.create", async () => {
			const categoryData = { name: "Electric Devices" };
			const mockCreated = {
				...categoryData,
				slug: "electric-devices",
				_id: "1",
			};
			categoryRepository.create.mockResolvedValue(mockCreated);

			const result = await categoryService.createCategory(categoryData);

			expect(categoryRepository.create).toHaveBeenCalledWith(
				expect.objectContaining({
					name: "Electric Devices",
					slug: "electric-devices",
				})
			);
			expect(result.slug).toBe("electric-devices");
		});

		it("should handle special characters in slug generation", async () => {
			const categoryData = { name: "Men's Fashion & Accessories!" };
			categoryRepository.create.mockImplementation((data) =>
				Promise.resolve(data)
			);

			const result = await categoryService.createCategory(categoryData);

			expect(result.slug).toBe("mens-fashion-and-accessories");
		});
	});

	describe("getCategoryById", () => {
		it("should call repository.findById", async () => {
			const id = "1";
			categoryRepository.findById.mockResolvedValue({ _id: id, name: "Test" });
			const result = await categoryService.getCategoryById(id);
			expect(categoryRepository.findById).toHaveBeenCalledWith(id);
			expect(result.name).toBe("Test");
		});
	});

	describe("updateCategory", () => {
		it("should regenerate slug if name is provided", async () => {
			const id = "1";
			const updateData = { name: "Automotive Tools" };
			categoryRepository.updateById.mockImplementation((id, data) =>
				Promise.resolve({ id, ...data })
			);

			const result = await categoryService.updateCategory(id, updateData);

			expect(result.slug).toBe("automotive-tools");
			expect(categoryRepository.updateById).toHaveBeenCalledWith(
				id,
				expect.objectContaining({
					slug: "automotive-tools",
				})
			);
		});

		it("should not regenerate slug if name is not provided", async () => {
			const id = "1";
			const updateData = { description: "Updated desc" };
			categoryRepository.updateById.mockImplementation((id, data) =>
				Promise.resolve({ id, ...data })
			);

			const result = await categoryService.updateCategory(id, updateData);

			expect(result.slug).toBeUndefined();
			expect(categoryRepository.updateById).toHaveBeenCalledWith(
				id,
				updateData
			);
		});
	});

	describe("deleteCategory", () => {
		it("should call repository.deleteById", async () => {
			const id = "1";
			categoryRepository.deleteById.mockResolvedValue({ _id: id });
			const result = await categoryService.deleteCategory(id);
			expect(categoryRepository.deleteById).toHaveBeenCalledWith(id);
			expect(result._id).toBe(id);
		});
	});

	describe("listCategories", () => {
		it("should call repository.list", async () => {
			categoryRepository.list.mockResolvedValue([{ name: "Test" }]);
			const result = await categoryService.listCategories();
			expect(categoryRepository.list).toHaveBeenCalled();
			expect(result).toHaveLength(1);
		});
	});
});
