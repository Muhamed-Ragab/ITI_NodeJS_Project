import { StatusCodes } from "http-status-codes";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as reviewsController from "../../../src/modules/reviews/reviews.controller.js";
import * as reviewsService from "../../../src/modules/reviews/reviews.service.js";
import { sendSuccess } from "../../../src/utils/response.js";

vi.mock("../../../src/modules/reviews/reviews.service.js");
vi.mock("../../../src/utils/response.js", () => ({
	sendSuccess: vi.fn(),
	sendError: vi.fn(),
}));

describe("Reviews Controller", () => {
	let req;
	let res;

	beforeEach(() => {
		vi.clearAllMocks();
		req = {
			body: {},
			params: {},
			query: {},
			user: { id: "u1", role: "customer" },
		};
		res = {
			status: vi.fn().mockReturnThis(),
			json: vi.fn().mockReturnThis(),
		};
	});

	it("creates review and returns 201", async () => {
		req.body = { product_id: "p1", rating: 5, comment: "Great" };
		const review = { _id: "r1", ...req.body, user_id: "u1" };
		reviewsService.createReview.mockResolvedValue(review);

		await reviewsController.createReview(req, res);

		expect(reviewsService.createReview).toHaveBeenCalledWith("u1", req.body);
		expect(sendSuccess).toHaveBeenCalledWith(
			res,
			expect.objectContaining({
				statusCode: StatusCodes.CREATED,
				data: review,
			})
		);
	});

	it("gets review by id", async () => {
		req.params.id = "r1";
		const review = { _id: "r1", rating: 4 };
		reviewsService.getReviewById.mockResolvedValue(review);

		await reviewsController.getReviewById(req, res);

		expect(reviewsService.getReviewById).toHaveBeenCalledWith("r1");
		expect(sendSuccess).toHaveBeenCalledWith(
			res,
			expect.objectContaining({
				statusCode: StatusCodes.OK,
				data: review,
			})
		);
	});

	it("lists product reviews", async () => {
		req.params.productId = "p1";
		req.query = { page: "1", limit: "10" };
		const payload = {
			reviews: [{ _id: "r1" }],
			pagination: { page: 1, limit: 10, total: 1, pages: 1 },
		};
		reviewsService.listReviewsByProduct.mockResolvedValue(payload);

		await reviewsController.listProductReviews(req, res);

		expect(reviewsService.listReviewsByProduct).toHaveBeenCalledWith("p1", {
			page: "1",
			limit: "10",
		});
		expect(sendSuccess).toHaveBeenCalledWith(
			res,
			expect.objectContaining({
				statusCode: StatusCodes.OK,
				data: payload,
			})
		);
	});

	it("updates review", async () => {
		req.params.id = "r1";
		req.body = { rating: 2 };
		const review = { _id: "r1", rating: 2 };
		reviewsService.updateReview.mockResolvedValue(review);

		await reviewsController.updateReview(req, res);

		expect(reviewsService.updateReview).toHaveBeenCalledWith(
			"r1",
			"u1",
			"customer",
			{ rating: 2 }
		);
		expect(sendSuccess).toHaveBeenCalledWith(
			res,
			expect.objectContaining({
				statusCode: StatusCodes.OK,
				data: review,
			})
		);
	});

	it("deletes review", async () => {
		req.params.id = "r1";
		const review = { _id: "r1", deletedAt: new Date() };
		reviewsService.deleteReview.mockResolvedValue(review);

		await reviewsController.deleteReview(req, res);

		expect(reviewsService.deleteReview).toHaveBeenCalledWith(
			"r1",
			"u1",
			"customer"
		);
		expect(sendSuccess).toHaveBeenCalledWith(
			res,
			expect.objectContaining({
				statusCode: StatusCodes.OK,
				data: review,
			})
		);
	});
});
