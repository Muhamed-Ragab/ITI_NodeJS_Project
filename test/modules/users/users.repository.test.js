import { beforeEach, describe, expect, it, vi } from "vitest";
import User from "../../../src/modules/users/user.model.js";
import * as userRepo from "../../../src/modules/users/users.repository.js";

vi.mock("../../../src/modules/users/user.model.js", () => ({
	default: {
		findOne: vi.fn(),
		findOneAndUpdate: vi.fn(),
		find: vi.fn(),
	},
}));

describe("Users Repository", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("findById should query non-deleted user", async () => {
		await userRepo.findById("123");
		expect(User.findOne).toHaveBeenCalledWith({
			_id: "123",
			deletedAt: null,
		});
	});

	it("addAddress should call User.findOneAndUpdate with push", async () => {
		await userRepo.addAddress("u1", { street: "X" });
		expect(User.findOneAndUpdate).toHaveBeenCalledWith(
			{ _id: "u1", deletedAt: null },
			expect.objectContaining({ $push: { addresses: { street: "X" } } }),
			expect.any(Object)
		);
	});
});
