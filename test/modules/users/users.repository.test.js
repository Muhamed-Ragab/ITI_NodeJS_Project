import { beforeEach, describe, expect, it, vi } from "vitest";
import User from "../../../src/modules/users/user.model.js";
import * as userRepo from "../../../src/modules/users/users.repository.js";

vi.mock("../../../src/modules/users/user.model.js", () => ({
	default: {
		findById: vi.fn(),
		findByIdAndUpdate: vi.fn(),
		findOneAndUpdate: vi.fn(),
		findOne: vi.fn(),
		find: vi.fn(),
	},
}));

describe("Users Repository", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("findById should call User.findById", async () => {
		await userRepo.findById("123");
		expect(User.findById).toHaveBeenCalledWith("123");
	});

	it("addAddress should call User.findByIdAndUpdate with push", async () => {
		await userRepo.addAddress("u1", { street: "X" });
		expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
			"u1",
			expect.objectContaining({ $push: { addresses: { street: "X" } } }),
			expect.any(Object)
		);
	});
});
