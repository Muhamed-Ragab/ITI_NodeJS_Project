import { beforeEach, describe, expect, it, vi } from "vitest";
import * as contentRepo from "../../../src/modules/content/content.repository.js";
import * as contentService from "../../../src/modules/content/content.service.js";
import { ApiError } from "../../../src/utils/errors/api-error.js";

vi.mock("../../../src/modules/content/content.repository.js");

describe("Content Service", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should create content when slug is unique", async () => {
		contentRepo.findBySlug.mockResolvedValue(null);
		contentRepo.create.mockResolvedValue({ _id: "c1", slug: "home-banner" });

		const result = await contentService.createContent({ slug: "home-banner" });

		expect(result).toEqual({ _id: "c1", slug: "home-banner" });
		expect(contentRepo.create).toHaveBeenCalledWith({ slug: "home-banner" });
	});

	it("should reject duplicate slug on create", async () => {
		contentRepo.findBySlug.mockResolvedValue({ _id: "existing" });

		await expect(
			contentService.createContent({ slug: "home-banner" })
		).rejects.toThrow(ApiError);
	});

	it("should return not found for missing content by id", async () => {
		contentRepo.findById.mockResolvedValue(null);

		await expect(contentService.getContentById("id-1")).rejects.toThrow(
			ApiError
		);
	});
});
