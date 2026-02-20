import { beforeEach, describe, expect, it, vi } from "vitest";
import * as authRepository from "../../../src/modules/auth/auth.repository.js";
import User from "../../../src/modules/users/user.model.js";

vi.mock("../../../src/modules/users/user.model.js", () => ({
	default: {
		findOne: vi.fn(),
		findById: vi.fn(),
		findByIdAndUpdate: vi.fn(),
		create: vi.fn(),
	},
}));

describe("Auth Repository", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("findUserByEmail should call User.findOne with select", async () => {
		const mockSelect = vi.fn().mockResolvedValue({ email: "test@example.com" });
		User.findOne.mockReturnValue({ select: mockSelect });

		await authRepository.findUserByEmail("test@example.com");

		expect(User.findOne).toHaveBeenCalledWith({ email: "test@example.com" });
		expect(mockSelect).toHaveBeenCalledWith("+password");
	});

	it("findUserByGoogleId should call User.findOne", async () => {
		const googleId = "123";
		await authRepository.findUserByGoogleId(googleId);
		expect(User.findOne).toHaveBeenCalledWith({ googleId });
	});

	it("attachGoogleIdToUser should call User.findByIdAndUpdate", async () => {
		const userId = "user-id";
		const googleId = "google-id";

		await authRepository.attachGoogleIdToUser(userId, googleId);

		expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
			userId,
			{ googleId },
			{ new: true, runValidators: true }
		);
	});

	it("createUser should call User.create", async () => {
		const data = { name: "Test" };
		await authRepository.createUser(data);
		expect(User.create).toHaveBeenCalledWith(data);
	});

	it("findUserById should call User.findById", async () => {
		await authRepository.findUserById("u1");

		expect(User.findById).toHaveBeenCalledWith("u1");
	});

	it("incrementTokenVersion should increment tokenVersion", async () => {
		await authRepository.incrementTokenVersion("u1");

		expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
			"u1",
			{ $inc: { tokenVersion: 1 } },
			{ new: true }
		);
	});
});
