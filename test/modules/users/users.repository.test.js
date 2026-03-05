import { beforeEach, describe, expect, it, vi } from "vitest";
import User from "../../../src/modules/users/user.model.js";
import * as userRepo from "../../../src/modules/users/users.repository.js";

const mockQuery = {
	populate: vi.fn().mockReturnThis(),
	select: vi.fn().mockReturnThis(),
	sort: vi.fn().mockReturnThis(),
	exec: vi.fn().mockResolvedValue({}),
};

vi.mock("../../../src/modules/users/user.model.js", () => ({
	default: {
		findOne: vi.fn(() => mockQuery),
		findOneAndUpdate: vi.fn(() => mockQuery),
		find: vi.fn(() => mockQuery),
		updateOne: vi.fn().mockResolvedValue({}),
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
			expect.any(Object),
		);
	});
});
