import { beforeEach, describe, expect, it, vi } from "vitest";
import * as userRepo from "../../../src/modules/users/users.repository.js";
import * as userService from "../../../src/modules/users/users.service.js";
import { ApiError } from "../../../src/utils/errors/api-error.js";

vi.mock("../../../src/modules/users/users.repository.js");

describe("Users Service", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("getUserById", () => {
		it("should return user if found", async () => {
			const mockUser = { _id: "123", name: "Test" };
			userRepo.findById.mockResolvedValue(mockUser);

			const result = await userService.getUserById("123");
			expect(result).toEqual(mockUser);
		});

		it("should throw not found if user missing", async () => {
			userRepo.findById.mockResolvedValue(null);
			await expect(userService.getUserById("123")).rejects.toThrow(ApiError);
		});
	});

	describe("updateUserProfile", () => {
		it("should pass data directly to repo (hashing in hooks)", async () => {
			const mockUpdated = { _id: "123", name: "New" };
			userRepo.updateById.mockResolvedValue(mockUpdated);

			const result = await userService.updateUserProfile("123", {
				name: "New",
			});
			expect(userRepo.updateById).toHaveBeenCalledWith("123", { name: "New" });
			expect(result).toEqual(mockUpdated);
		});
	});

	describe("upsertCartItem", () => {
		it("should update if item exists", async () => {
			userRepo.findCartItem.mockResolvedValue({ product: "p1" });
			userRepo.updateCartItem.mockResolvedValue({ cart: ["p1"] });

			await userService.upsertCartItem("u1", "p1", 2);
			expect(userRepo.updateCartItem).toHaveBeenCalledWith("u1", "p1", 2);
		});

		it("should add if item missing", async () => {
			userRepo.findCartItem.mockResolvedValue(null);
			userRepo.addCartItem.mockResolvedValue({ cart: ["p1"] });

			await userService.upsertCartItem("u1", "p1", 2);
			expect(userRepo.addCartItem).toHaveBeenCalledWith("u1", "p1", 2);
		});
	});

	describe("admin restriction/soft delete", () => {
		it("should set user restriction", async () => {
			userRepo.setRestriction.mockResolvedValue({
				_id: "u1",
				isRestricted: true,
			});

			const result = await userService.setUserRestriction("u1", true);

			expect(userRepo.setRestriction).toHaveBeenCalledWith("u1", true);
			expect(result.isRestricted).toBe(true);
		});

		it("should soft delete user", async () => {
			userRepo.softDeleteById.mockResolvedValue({
				_id: "u1",
				deletedAt: new Date(),
			});

			const result = await userService.softDeleteUser("u1");

			expect(userRepo.softDeleteById).toHaveBeenCalledWith("u1");
			expect(result._id).toBe("u1");
		});
	});

	describe("phase 4 marketing & engagement", () => {
		it("should merge and update marketing preferences", async () => {
			userRepo.findById.mockResolvedValue({
				_id: "u1",
				marketing_preferences: {
					push_notifications: true,
					email_newsletter: false,
					promotional_notifications: true,
				},
			});
			userRepo.updateMarketingPreferences.mockResolvedValue({
				marketing_preferences: {
					push_notifications: true,
					email_newsletter: true,
					promotional_notifications: true,
				},
			});

			const result = await userService.updateMarketingPreferences("u1", {
				email_newsletter: true,
			});

			expect(userRepo.updateMarketingPreferences).toHaveBeenCalledWith("u1", {
				push_notifications: true,
				email_newsletter: true,
				promotional_notifications: true,
			});
			expect(result.email_newsletter).toBe(true);
		});

		it("should update preferred language", async () => {
			userRepo.updatePreferredLanguage.mockResolvedValue({
				preferred_language: "ar",
			});

			const result = await userService.updatePreferredLanguage("u1", "ar");

			expect(result).toEqual({ language: "ar" });
		});

		it("should apply referral code and return reward summary", async () => {
			userRepo.applyReferralCode.mockResolvedValue({
				rewardPoints: 25,
				referrerId: "ref1",
				updatedUser: { loyalty_points: 45 },
			});

			const result = await userService.applyReferralCode("u1", "REF-1234");

			expect(result).toEqual({
				reward_points: 25,
				referred_by: "ref1",
				loyalty_points: 45,
			});
		});

		it("should reject already applied referral code", async () => {
			userRepo.applyReferralCode.mockResolvedValue({
				error: "REFERRAL_ALREADY_APPLIED",
			});

			await expect(
				userService.applyReferralCode("u1", "REF-1234")
			).rejects.toThrow(ApiError);
		});

		it("should return loyalty summary", async () => {
			userRepo.findById.mockResolvedValue({
				loyalty_points: 100,
				referrals_count: 2,
			});

			const result = await userService.getLoyaltySummary("u1");

			expect(result).toEqual({ loyalty_points: 100, referrals_count: 2 });
		});

		it("should create referral code when missing", async () => {
			userRepo.findById.mockResolvedValue({
				_id: "507f1f77bcf86cd799439011",
				referrals_count: 0,
				referred_by: null,
			});
			userRepo.updateById.mockResolvedValue({
				referral_code: "REF-439011",
			});

			const result = await userService.getReferralSummary(
				"507f1f77bcf86cd799439011"
			);

			expect(result.referral_code).toBe("REF-439011");
		});

		it("should grant loyalty points", async () => {
			userRepo.grantLoyaltyPoints.mockResolvedValue({ loyalty_points: 200 });

			const result = await userService.grantLoyaltyPoints("u1", 50, "purchase");

			expect(result).toEqual({ loyalty_points: 200, granted_points: 50 });
		});

		it("should broadcast marketing summary", async () => {
			userRepo.listUsersForMarketing.mockResolvedValue([
				{ _id: "u1" },
				{ _id: "u2" },
			]);

			const result = await userService.broadcastMarketingMessage({
				channel: "email",
				title: "Promo",
				body: "Body",
			});

			expect(result.recipients_count).toBe(2);
		});
	});
});
