import { StatusCodes } from "http-status-codes";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as categoryController from "../../../src/modules/categories/categories.controller.js";
import * as categoryService from "../../../src/modules/categories/categories.service.js";
import { ApiError } from "../../../src/utils/errors/api-error.js";
import { sendSuccess } from "../../../src/utils/response.js";

vi.mock("../../../src/modules/categories/categories.service.js");
vi.mock("../../../src/utils/response.js", () => ({
	sendSuccess: vi.fn(),
	sendError: vi.fn(),
}));

describe("Categories Controller", () => {
	let req, res;

	beforeEach(() => {
		vi.clearAllMocks();
		req = {
			body: {},
			params: {},
		};
		res = {
			status: vi.fn().mockReturnThis(),
			json: vi.fn().mockReturnThis(),
		};
	});

	describe("createCategory", () => {
		it("should create a category and return 201", async () => {
			req.body = { name: "Electronics" };
			const mockCategory = { _id: "1", ...req.body };
			categoryService.createCategory.mockResolvedValue(mockCategory);

			await categoryController.createCategory(req, res);

			expect(categoryService.createCategory).toHaveBeenCalledWith(req.body);
			expect(sendSuccess).toHaveBeenCalledWith(
				res,
				expect.objectContaining({
					statusCode: StatusCodes.CREATED,
					data: mockCategory,
				})
			);
		});

		it("should throw if category name is duplicate", async () => {
			req.body = { name: "Electronics" };
			const error = new Error("Duplicate");
			error.code = 11_000;
			categoryService.createCategory.mockRejectedValue(error);

			await expect(categoryController.createCategory(req, res)).rejects.toBe(
				error
			);
		});

		it("should throw for other service errors", async () => {
			const error = new Error("Random error");
			categoryService.createCategory.mockRejectedValue(error);

			await expect(categoryController.createCategory(req, res)).rejects.toBe(
				error
			);
		});
	});

	describe("getCategoryById", () => {
		it("should return category if found", async () => {
			req.params.id = "1";
			const mockCategory = { _id: "1", name: "Electronics" };
			categoryService.getCategoryById.mockResolvedValue(mockCategory);

			await categoryController.getCategoryById(req, res);

			expect(sendSuccess).toHaveBeenCalledWith(
				res,
				expect.objectContaining({
					data: mockCategory,
				})
			);
		});

		it("should throw 404 if category not found", async () => {
			req.params.id = "1";
			const error = ApiError.notFound({
				code: "CATEGORY.NOT_FOUND",
				message: "Category not found",
			});
			categoryService.getCategoryById.mockRejectedValue(error);

			await expect(categoryController.getCategoryById(req, res)).rejects.toBe(
				error
			);
		});

		it("should throw for CastError (invalid ID format)", async () => {
			req.params.id = "invalid";
			const error = new Error("Cast failed");
			error.name = "CastError";
			categoryService.getCategoryById.mockRejectedValue(error);

			await expect(categoryController.getCategoryById(req, res)).rejects.toBe(
				error
			);
		});

		it("should throw for other errors", async () => {
			const error = new Error("Fail");
			categoryService.getCategoryById.mockRejectedValue(error);

			await expect(categoryController.getCategoryById(req, res)).rejects.toBe(
				error
			);
		});
	});

	describe("updateCategory", () => {
		it("should update category and return 200", async () => {
			req.params.id = "1";
			req.body = { name: "New Name" };
			const mockCategory = { _id: "1", ...req.body };
			categoryService.updateCategory.mockResolvedValue(mockCategory);

			await categoryController.updateCategory(req, res);

			expect(sendSuccess).toHaveBeenCalledWith(
				res,
				expect.objectContaining({
					data: mockCategory,
				})
			);
		});

		it("should throw 404 if category not found", async () => {
			req.params.id = "1";
			const error = ApiError.notFound({
				code: "CATEGORY.NOT_FOUND",
				message: "Category not found",
			});
			categoryService.updateCategory.mockRejectedValue(error);

			await expect(categoryController.updateCategory(req, res)).rejects.toBe(
				error
			);
		});

		it("should throw for CastError on update", async () => {
			req.params.id = "invalid";
			const error = new Error("Cast failed");
			error.name = "CastError";
			categoryService.updateCategory.mockRejectedValue(error);

			await expect(categoryController.updateCategory(req, res)).rejects.toBe(
				error
			);
		});

		it("should throw for duplicate name on update", async () => {
			req.params.id = "1";
			const error = new Error("Duplicate");
			error.code = 11_000;
			categoryService.updateCategory.mockRejectedValue(error);

			await expect(categoryController.updateCategory(req, res)).rejects.toBe(
				error
			);
		});

		it("should throw for other errors", async () => {
			const error = new Error("Fail");
			categoryService.updateCategory.mockRejectedValue(error);

			await expect(categoryController.updateCategory(req, res)).rejects.toBe(
				error
			);
		});
	});

	describe("deleteCategory", () => {
		it("should delete and return 200", async () => {
			req.params.id = "1";
			categoryService.deleteCategory.mockResolvedValue({ _id: "1" });

			await categoryController.deleteCategory(req, res);

			expect(sendSuccess).toHaveBeenCalledWith(
				res,
				expect.objectContaining({
					statusCode: StatusCodes.OK,
				})
			);
		});

		it("should throw 404 if category not found", async () => {
			req.params.id = "1";
			const error = ApiError.notFound({
				code: "CATEGORY.NOT_FOUND",
				message: "Category not found",
			});
			categoryService.deleteCategory.mockRejectedValue(error);

			await expect(categoryController.deleteCategory(req, res)).rejects.toBe(
				error
			);
		});

		it("should throw for CastError on delete", async () => {
			req.params.id = "invalid";
			const error = new Error("Cast failed");
			error.name = "CastError";
			categoryService.deleteCategory.mockRejectedValue(error);

			await expect(categoryController.deleteCategory(req, res)).rejects.toBe(
				error
			);
		});

		it("should throw for other errors", async () => {
			const error = new Error("Fail");
			categoryService.deleteCategory.mockRejectedValue(error);

			await expect(categoryController.deleteCategory(req, res)).rejects.toBe(
				error
			);
		});
	});

	describe("listCategories", () => {
		it("should return list of categories", async () => {
			const mockCategories = [{ name: "Cat 1" }];
			categoryService.listCategories.mockResolvedValue(mockCategories);

			await categoryController.listCategories(req, res);

			expect(sendSuccess).toHaveBeenCalledWith(
				res,
				expect.objectContaining({
					data: mockCategories,
				})
			);
		});

		it("should throw on error", async () => {
			const error = new Error("Fail");
			categoryService.listCategories.mockRejectedValue(error);

			await expect(categoryController.listCategories(req, res)).rejects.toBe(
				error
			);
		});
	});
});
