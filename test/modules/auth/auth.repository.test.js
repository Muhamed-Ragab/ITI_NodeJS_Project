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

	it("findUserByEmailWithOtp should query by email and select otp fields", async () => {
		const mockSelect = vi.fn().mockResolvedValue({ _id: "u1" });
		User.findOne.mockReturnValue({ select: mockSelect });

		await authRepository.findUserByEmailWithOtp("test@example.com");

		expect(User.findOne).toHaveBeenCalledWith({ email: "test@example.com" });
		expect(mockSelect).toHaveBeenCalledWith("+emailOtpHash +emailOtpExpiresAt");
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

	it("setEmailOtp should persist otp hash and expiry", async () => {
		const expiry = new Date("2030-01-01");
		await authRepository.setEmailOtp("u1", "otp-hash", expiry);

		expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
			"u1",
			{ emailOtpHash: "otp-hash", emailOtpExpiresAt: expiry },
			{ new: true }
		);
	});

	it("consumeEmailOtp should clear email otp", async () => {
		await authRepository.consumeEmailOtp("u1");

		expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
			"u1",
			{
				emailOtpHash: null,
				emailOtpExpiresAt: null,
			},
			{ new: true }
		);
	});

	it("findUserByEmailVerificationTokenHash should query and select secure fields", async () => {
		const mockSelect = vi.fn().mockResolvedValue({ _id: "u1" });
		User.findOne.mockReturnValue({ select: mockSelect });

		await authRepository.findUserByEmailVerificationTokenHash("hash-123");

		expect(User.findOne).toHaveBeenCalledWith({
			emailVerificationTokenHash: "hash-123",
		});
		expect(mockSelect).toHaveBeenCalledWith(
			"+emailVerificationTokenHash +emailVerificationTokenExpiresAt"
		);
	});

	it("verifyUserEmail should mark user as verified and clear token fields", async () => {
		await authRepository.verifyUserEmail("u1");

		expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
			"u1",
			{
				isEmailVerified: true,
				emailVerificationTokenHash: null,
				emailVerificationTokenExpiresAt: null,
			},
			{ new: true }
		);
	});
});
