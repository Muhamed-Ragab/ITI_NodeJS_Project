import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "../../../src/utils/errors/api-error.js";

vi.mock("../../../src/modules/products/products.repository.js", () => ({
	create: vi.fn(),
	findById: vi.fn(),
	updateById: vi.fn(),
	deleteById: vi.fn(),
	listWithFilters: vi.fn(),
	appendImages: vi.fn(),
}));

vi.mock("../../../src/services/cdn/index.js", () => ({
	createCdnProvider: vi.fn(() => ({
		uploadMany: vi.fn(async (images) => images.map((img) => `cdn://${img}`)),
		getUploadRequestPayload: vi.fn((options = {}) => ({
			uploadUrl: "https://api.cloudinary.com/v1_1/demo/image/upload",
			apiKey: "key",
			timestamp: 123,
			signature: "sig",
			folder: options.folder ?? "products",
		})),
	})),
}));

const repository = await import("../../../src/modules/products/products.repository.js");
const service = await import("../../../src/modules/products/products.service.js");

describe("Products Service", () => {
	beforeEach(() => vi.clearAllMocks());

	it("creates product with seller id", async () => {
		repository.create.mockResolvedValue({ _id: "p1" });
		await service.createProduct({ title: "Phone" }, "seller1");
		expect(repository.create).toHaveBeenCalledWith(
			expect.objectContaining({ seller_id: "seller1", title: "Phone" })
		);
	});

	it("throws ApiError on duplicate create", async () => {
		repository.create.mockRejectedValue({ code: 11_000 });
		await expect(service.createProduct({ title: "Phone" }, "seller1")).rejects.toBeInstanceOf(
			ApiError
		);
	});

	it("throws not found when update target missing", async () => {
		repository.findById.mockResolvedValue(null);
		await expect(service.updateProduct("p1", {}, "s1")).rejects.toBeInstanceOf(ApiError);
	});

	it("throws forbidden when updating another seller product", async () => {
		repository.findById.mockResolvedValue({ seller_id: { _id: "s2", toString: () => "s2" } });
		await expect(service.updateProduct("p1", {}, "s1")).rejects.toBeInstanceOf(ApiError);
	});

	it("uploads images via cdn provider then appends", async () => {
		repository.findById.mockResolvedValue({ seller_id: { _id: { toString: () => "s1" } } });
		repository.appendImages.mockResolvedValue({ _id: "p1" });
		await service.uploadImages("p1", ["a", "b"], "s1");
		expect(repository.appendImages).toHaveBeenCalledWith("p1", ["cdn://a", "cdn://b"]);
	});

	it("returns upload payload for authenticated seller", async () => {
		const payload = await service.getImageUploadPayload("seller1", {
			folder: "products/custom",
		});

		expect(payload).toEqual(
			expect.objectContaining({
				uploadUrl: expect.stringContaining("cloudinary.com"),
				folder: "products/custom",
			})
		);
	});

	it("throws unauthorized when generating upload payload without seller", async () => {
		expect(() => service.getImageUploadPayload(null)).toThrow(ApiError);
	});
});
