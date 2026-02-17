import { beforeEach, describe, expect, it, vi } from "vitest";
import CategoryModel from "../../../src/modules/categories/categories.model.js";
import * as categoryRepository from "../../../src/modules/categories/categories.repository.js";

vi.mock("../../../src/modules/categories/categories.model.js", () => ({
	default: {
		create: vi.fn(),
		findById: vi.fn(),
		findByIdAndUpdate: vi.fn(),
		findByIdAndDelete: vi.fn(),
		find: vi.fn(),
	},
}));

describe("Categories Repository", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("create", () => {
		it("should call CategoryModel.create with category data", async () => {
			const categoryData = { name: "Electronics", slug: "electronics" };
			CategoryModel.create.mockResolvedValue(categoryData);

			const result = await categoryRepository.create(categoryData);

			expect(CategoryModel.create).toHaveBeenCalledWith(categoryData);
			expect(result).toEqual(categoryData);
		});
	});

	describe("findById", () => {
		it("should call CategoryModel.findById with id", async () => {
			const id = "507f1f77bcf86cd799439011";
			CategoryModel.findById.mockResolvedValue({
				_id: id,
				name: "Electronics",
			});

			const result = await categoryRepository.findById(id);

			expect(CategoryModel.findById).toHaveBeenCalledWith(id);
			expect(result.name).toBe("Electronics");
		});
	});

	describe("updateById", () => {
		it("should call CategoryModel.findByIdAndUpdate with correct params", async () => {
			const id = "507f1f77bcf86cd799439011";
			const updateData = { name: "New Name" };
			CategoryModel.findByIdAndUpdate.mockResolvedValue({
				_id: id,
				...updateData,
			});

			const result = await categoryRepository.updateById(id, updateData);

			expect(CategoryModel.findByIdAndUpdate).toHaveBeenCalledWith(
				id,
				updateData,
				expect.objectContaining({ new: true, runValidators: true })
			);
			expect(result.name).toBe("New Name");
		});
	});

	describe("deleteById", () => {
		it("should call CategoryModel.findByIdAndDelete", async () => {
			const id = "507f1f77bcf86cd799439011";
			CategoryModel.findByIdAndDelete.mockResolvedValue({ _id: id });

			const result = await categoryRepository.deleteById(id);

			expect(CategoryModel.findByIdAndDelete).toHaveBeenCalledWith(id);
			expect(result._id).toBe(id);
		});
	});

	describe("list", () => {
		it("should call CategoryModel.find with sort", async () => {
			const mockQuery = {
				sort: vi.fn().mockResolvedValue([{ name: "Cat 1" }, { name: "Cat 2" }]),
			};
			CategoryModel.find.mockReturnValue(mockQuery);

			const result = await categoryRepository.list();

			expect(CategoryModel.find).toHaveBeenCalled();
			expect(mockQuery.sort).toHaveBeenCalledWith({ createdAt: -1 });
			expect(result).toHaveLength(2);
		});
	});
});
