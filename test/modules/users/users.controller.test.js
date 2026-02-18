import { beforeEach, describe, expect, it, vi } from "vitest";
import * as userController from "../../../src/modules/users/users.controller.js";
import * as userService from "../../../src/modules/users/users.service.js";
import { sendSuccess } from "../../../src/utils/response.js";

vi.mock("../../../src/modules/users/users.service.js");
vi.mock("../../../src/utils/response.js", () => ({
	sendSuccess: vi.fn(),
	sendError: vi.fn(),
}));

describe("Users Controller", () => {
	let req, res, next;

	beforeEach(() => {
		vi.clearAllMocks();
		req = {
			user: { id: "user123" },
			body: {},
			params: {},
		};
		res = {
			status: vi.fn().mockReturnThis(),
			json: vi.fn().mockReturnThis(),
		};
		next = vi.fn();
	});

	describe("getProfile", () => {
		it("should return user profile", async () => {
			const mockUser = { id: "user123", name: "Test" };
			userService.getUserById.mockResolvedValue(mockUser);

			await userController.getProfile(req, res, next);

			expect(userService.getUserById).toHaveBeenCalledWith("user123");
			expect(sendSuccess).toHaveBeenCalledWith(
				res,
				expect.objectContaining({ data: mockUser })
			);
		});
	});

	describe("updateProfile", () => {
		it("should update profile", async () => {
			req.body = { name: "New Name" };
			const mockUpdated = { id: "user123", name: "New Name" };
			userService.updateUserProfile.mockResolvedValue(mockUpdated);

			await userController.updateProfile(req, res, next);

			expect(userService.updateUserProfile).toHaveBeenCalledWith(
				"user123",
				req.body
			);
			expect(sendSuccess).toHaveBeenCalledWith(
				res,
				expect.objectContaining({ message: "Profile updated successfully" })
			);
		});
	});

	describe("wishlist", () => {
		it("should add item to wishlist", async () => {
			req.body = { productId: "prod123" };
			userService.addProductToWishlist.mockResolvedValue(["prod123"]);

			await userController.addWishlistItem(req, res, next);

			expect(userService.addProductToWishlist).toHaveBeenCalledWith(
				"user123",
				"prod123"
			);
			expect(sendSuccess).toHaveBeenCalled();
		});
	});
});
