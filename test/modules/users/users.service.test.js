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
});
