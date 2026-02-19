import { beforeEach, describe, expect, it, vi } from "vitest";
import CategoryModel from "../../../src/modules/categories/categories.model.js";
import * as categoryRepository from "../../../src/modules/categories/categories.repository.js";

vi.mock("../../../src/modules/categories/categories.model.js", () => ({
	default: {
		create: vi.fn(),
		findOne: vi.fn(),
		findOneAndUpdate: vi.fn(),
		countDocuments: vi.fn(),
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
			CategoryModel.findOne.mockResolvedValue({
				_id: id,
				name: "Electronics",
			});

			const result = await categoryRepository.findById(id);

			expect(CategoryModel.findOne).toHaveBeenCalledWith({
				_id: id,
				deletedAt: null,
			});
			expect(result.name).toBe("Electronics");
		});
	});

	describe("updateById", () => {
		it("should call CategoryModel.findOneAndUpdate with correct params", async () => {
			const id = "507f1f77bcf86cd799439011";
			const updateData = { name: "New Name" };
			CategoryModel.findOneAndUpdate.mockResolvedValue({
				_id: id,
				...updateData,
			});

			const result = await categoryRepository.updateById(id, updateData);

			expect(CategoryModel.findOneAndUpdate).toHaveBeenCalledWith(
				{ _id: id, deletedAt: null },
				updateData,
				expect.objectContaining({ new: true, runValidators: true })
			);
			expect(result.name).toBe("New Name");
		});
	});

	describe("deleteById", () => {
		it("should soft delete category", async () => {
			const id = "507f1f77bcf86cd799439011";
			CategoryModel.findOneAndUpdate.mockResolvedValue({ _id: id });

			const result = await categoryRepository.deleteById(id);

			expect(CategoryModel.findOneAndUpdate).toHaveBeenCalledWith(
				{ _id: id, deletedAt: null },
				expect.objectContaining({ deletedAt: expect.any(Date) }),
				expect.objectContaining({ new: true })
			);
			expect(result._id).toBe(id);
		});
	});

	describe("list", () => {
		it("should return paginated list", async () => {
			const mockQuery = {
				sort: vi.fn().mockReturnThis(),
				skip: vi.fn().mockReturnThis(),
				limit: vi
					.fn()
					.mockResolvedValue([{ name: "Cat 1" }, { name: "Cat 2" }]),
			};
			CategoryModel.find.mockReturnValue(mockQuery);
			CategoryModel.countDocuments.mockResolvedValue(2);

			const result = await categoryRepository.list();

			expect(CategoryModel.find).toHaveBeenCalled();
			expect(mockQuery.sort).toHaveBeenCalledWith({ createdAt: -1 });
			expect(mockQuery.skip).toHaveBeenCalledWith(0);
			expect(mockQuery.limit).toHaveBeenCalledWith(10);
			expect(CategoryModel.countDocuments).toHaveBeenCalledWith({
				deletedAt: null,
			});
			expect(result.categories).toHaveLength(2);
		});
	});
});
