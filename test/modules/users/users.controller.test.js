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

	describe("phase 4 marketing & engagement", () => {
		it("should update marketing preferences", async () => {
			req.body = { email_newsletter: true };
			userService.updateMarketingPreferences.mockResolvedValue({
				email_newsletter: true,
			});

			await userController.updateMarketingPreferences(req, res, next);

			expect(userService.updateMarketingPreferences).toHaveBeenCalledWith(
				"user123",
				req.body
			);
			expect(sendSuccess).toHaveBeenCalled();
		});

		it("should apply referral code", async () => {
			req.body = { code: "REF-1234" };
			userService.applyReferralCode.mockResolvedValue({ reward_points: 25 });

			await userController.applyReferralCode(req, res, next);

			expect(userService.applyReferralCode).toHaveBeenCalledWith(
				"user123",
				"REF-1234"
			);
			expect(sendSuccess).toHaveBeenCalled();
		});

		it("should grant loyalty points from admin endpoint", async () => {
			req.params = { id: "u1" };
			req.body = { points: 50, reason: "campaign" };
			userService.grantLoyaltyPoints.mockResolvedValue({
				loyalty_points: 200,
				granted_points: 50,
			});

			await userController.grantLoyaltyPoints(req, res, next);

			expect(userService.grantLoyaltyPoints).toHaveBeenCalledWith(
				"u1",
				50,
				"campaign"
			);
			expect(sendSuccess).toHaveBeenCalled();
		});
	});
});
