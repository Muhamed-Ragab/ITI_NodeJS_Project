import { StatusCodes } from "http-status-codes";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as categoryController from "../../../src/modules/categories/categories.controller.js";
import * as categoryService from "../../../src/modules/categories/categories.service.js";
import { sendError, sendSuccess } from "../../../src/utils/response.js";

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

		it("should return 409 if category name is duplicate", async () => {
			req.body = { name: "Electronics" };
			const error = new Error("Duplicate");
			error.code = 11_000;
			categoryService.createCategory.mockRejectedValue(error);

			await categoryController.createCategory(req, res);

			expect(sendError).toHaveBeenCalledWith(
				res,
				expect.objectContaining({
					statusCode: StatusCodes.CONFLICT,
					code: "CATEGORY.DUPLICATE",
				})
			);
		});

		it("should return 500 for other service errors", async () => {
			categoryService.createCategory.mockRejectedValue(
				new Error("Random error")
			);

			await categoryController.createCategory(req, res);

			expect(sendError).toHaveBeenCalledWith(
				res,
				expect.objectContaining({
					statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
				})
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

		it("should return 404 if category not found", async () => {
			req.params.id = "1";
			categoryService.getCategoryById.mockResolvedValue(null);

			await categoryController.getCategoryById(req, res);

			expect(sendError).toHaveBeenCalledWith(
				res,
				expect.objectContaining({
					statusCode: StatusCodes.NOT_FOUND,
				})
			);
		});

		it("should return 400 for CastError (invalid ID format)", async () => {
			req.params.id = "invalid";
			const error = new Error("Cast failed");
			error.name = "CastError";
			categoryService.getCategoryById.mockRejectedValue(error);

			await categoryController.getCategoryById(req, res);

			expect(sendError).toHaveBeenCalledWith(
				res,
				expect.objectContaining({
					statusCode: StatusCodes.BAD_REQUEST,
					code: "CATEGORY.INVALID_ID",
				})
			);
		});

		it("should return 500 for other errors", async () => {
			categoryService.getCategoryById.mockRejectedValue(new Error("Fail"));

			await categoryController.getCategoryById(req, res);

			expect(sendError).toHaveBeenCalledWith(
				res,
				expect.objectContaining({
					statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
				})
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

		it("should return 404 if category not found", async () => {
			req.params.id = "1";
			categoryService.updateCategory.mockResolvedValue(null);

			await categoryController.updateCategory(req, res);

			expect(sendError).toHaveBeenCalledWith(
				res,
				expect.objectContaining({
					statusCode: StatusCodes.NOT_FOUND,
				})
			);
		});

		it("should return 400 for CastError on update", async () => {
			req.params.id = "invalid";
			const error = new Error("Cast failed");
			error.name = "CastError";
			categoryService.updateCategory.mockRejectedValue(error);

			await categoryController.updateCategory(req, res);

			expect(sendError).toHaveBeenCalledWith(
				res,
				expect.objectContaining({
					statusCode: StatusCodes.BAD_REQUEST,
				})
			);
		});

		it("should return 409 for duplicate name on update", async () => {
			req.params.id = "1";
			const error = new Error("Duplicate");
			error.code = 11_000;
			categoryService.updateCategory.mockRejectedValue(error);

			await categoryController.updateCategory(req, res);

			expect(sendError).toHaveBeenCalledWith(
				res,
				expect.objectContaining({
					statusCode: StatusCodes.CONFLICT,
				})
			);
		});

		it("should return 500 for other errors", async () => {
			categoryService.updateCategory.mockRejectedValue(new Error("Fail"));

			await categoryController.updateCategory(req, res);

			expect(sendError).toHaveBeenCalledWith(
				res,
				expect.objectContaining({
					statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
				})
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

		it("should return 404 if category not found", async () => {
			req.params.id = "1";
			categoryService.deleteCategory.mockResolvedValue(null);

			await categoryController.deleteCategory(req, res);

			expect(sendError).toHaveBeenCalledWith(
				res,
				expect.objectContaining({
					statusCode: StatusCodes.NOT_FOUND,
				})
			);
		});

		it("should return 400 for CastError on delete", async () => {
			req.params.id = "invalid";
			const error = new Error("Cast failed");
			error.name = "CastError";
			categoryService.deleteCategory.mockRejectedValue(error);

			await categoryController.deleteCategory(req, res);

			expect(sendError).toHaveBeenCalledWith(
				res,
				expect.objectContaining({
					statusCode: StatusCodes.BAD_REQUEST,
				})
			);
		});

		it("should return 500 for other errors", async () => {
			categoryService.deleteCategory.mockRejectedValue(new Error("Fail"));

			await categoryController.deleteCategory(req, res);

			expect(sendError).toHaveBeenCalledWith(
				res,
				expect.objectContaining({
					statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
				})
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

		it("should return 500 on error", async () => {
			categoryService.listCategories.mockRejectedValue(new Error("Fail"));

			await categoryController.listCategories(req, res);

			expect(sendError).toHaveBeenCalledWith(
				res,
				expect.objectContaining({
					statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
				})
			);
		});
	});
});
