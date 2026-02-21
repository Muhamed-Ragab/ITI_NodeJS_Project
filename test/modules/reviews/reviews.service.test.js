import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "../../../src/utils/errors/api-error.js";

vi.mock("../../../src/modules/products/products.repository.js", () => ({
	findById: vi.fn(),
	updateRatingStats: vi.fn(),
}));

vi.mock("../../../src/modules/reviews/reviews.repository.js", () => ({
	create: vi.fn(),
	findById: vi.fn(),
	findByProductAndUser: vi.fn(),
	updateById: vi.fn(),
	softDeleteById: vi.fn(),
	listByProduct: vi.fn(),
	calculateProductRatingStats: vi.fn(),
}));

const productsRepository = await import(
	"../../../src/modules/products/products.repository.js"
);
const reviewsRepository = await import(
	"../../../src/modules/reviews/reviews.repository.js"
);
const reviewsService = await import(
	"../../../src/modules/reviews/reviews.service.js"
);

describe("Reviews Service", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		productsRepository.updateRatingStats.mockResolvedValue({ _id: "p1" });
		reviewsRepository.calculateProductRatingStats.mockResolvedValue({
			average_rating: 4.5,
			ratings_count: 2,
		});
	});

	describe("createReview", () => {
		it("creates review and refreshes product stats", async () => {
			productsRepository.findById.mockResolvedValue({ _id: "p1" });
			reviewsRepository.findByProductAndUser.mockResolvedValue(null);
			reviewsRepository.create.mockResolvedValue({ _id: "r1" });
			reviewsRepository.findById.mockResolvedValue({
				_id: "r1",
				product_id: "p1",
			});

			const result = await reviewsService.createReview("u1", {
				product_id: "p1",
				rating: 5,
				comment: "Great",
			});

			expect(reviewsRepository.create).toHaveBeenCalledWith({
				product_id: "p1",
				user_id: "u1",
				rating: 5,
				comment: "Great",
			});
			expect(productsRepository.updateRatingStats).toHaveBeenCalledWith("p1", {
				average_rating: 4.5,
				ratings_count: 2,
			});
			expect(result).toEqual({ _id: "r1", product_id: "p1" });
		});

		it("throws not found if product does not exist", async () => {
			productsRepository.findById.mockResolvedValue(null);

			await expect(
				reviewsService.createReview("u1", {
					product_id: "missing",
					rating: 4,
				})
			).rejects.toMatchObject({ code: "REVIEW.PRODUCT_NOT_FOUND" });
		});

		it("throws bad request for duplicate review", async () => {
			productsRepository.findById.mockResolvedValue({ _id: "p1" });
			reviewsRepository.findByProductAndUser.mockResolvedValue({ _id: "r1" });

			await expect(
				reviewsService.createReview("u1", {
					product_id: "p1",
					rating: 4,
				})
			).rejects.toMatchObject({ code: "REVIEW.ALREADY_EXISTS" });
		});
	});

	describe("listReviewsByProduct", () => {
		it("returns paginated product reviews", async () => {
			productsRepository.findById.mockResolvedValue({ _id: "p1" });
			reviewsRepository.listByProduct.mockResolvedValue({
				reviews: [{ _id: "r1" }],
				pagination: { page: 1, limit: 10, total: 1, pages: 1 },
			});

			const result = await reviewsService.listReviewsByProduct("p1", {
				page: "1",
				limit: "10",
			});

			expect(reviewsRepository.listByProduct).toHaveBeenCalledWith("p1", {
				page: "1",
				limit: "10",
			});
			expect(result.reviews).toHaveLength(1);
		});
	});

	describe("updateReview", () => {
		it("updates review for owner and refreshes stats", async () => {
			reviewsRepository.findById.mockResolvedValue({
				_id: "r1",
				product_id: "p1",
				user_id: "u1",
			});
			reviewsRepository.updateById.mockResolvedValue({
				_id: "r1",
				rating: 3,
			});

			const result = await reviewsService.updateReview("r1", "u1", "customer", {
				rating: 3,
			});

			expect(reviewsRepository.updateById).toHaveBeenCalledWith("r1", {
				rating: 3,
			});
			expect(productsRepository.updateRatingStats).toHaveBeenCalled();
			expect(result).toEqual({ _id: "r1", rating: 3 });
		});

		it("throws forbidden when user is not owner or admin", async () => {
			reviewsRepository.findById.mockResolvedValue({
				_id: "r1",
				product_id: "p1",
				user_id: "other-user",
			});

			await expect(
				reviewsService.updateReview("r1", "u1", "customer", { rating: 1 })
			).rejects.toBeInstanceOf(ApiError);
		});
	});

	describe("deleteReview", () => {
		it("deletes review for admin and refreshes stats", async () => {
			reviewsRepository.findById.mockResolvedValue({
				_id: "r1",
				product_id: "p1",
				user_id: "u2",
			});
			reviewsRepository.softDeleteById.mockResolvedValue({
				_id: "r1",
				deletedAt: new Date(),
			});

			const result = await reviewsService.deleteReview("r1", "admin1", "admin");

			expect(reviewsRepository.softDeleteById).toHaveBeenCalledWith("r1");
			expect(productsRepository.updateRatingStats).toHaveBeenCalled();
			expect(result._id).toBe("r1");
		});
	});
});
