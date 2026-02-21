import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as emailProvider from "../../../src/services/notifications/email-provider.js";
import * as authRepository from "../../../src/modules/auth/auth.repository.js";
import * as authService from "../../../src/modules/auth/auth.service.js";
import { ApiError } from "../../../src/utils/errors/api-error.js";

vi.mock("../../../src/modules/auth/auth.repository.js");
vi.mock("../../../src/services/notifications/email-provider.js");
vi.mock("bcryptjs");
vi.mock("jsonwebtoken");

describe("Auth Service", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("registerUser", () => {
		it("should create an unverified user and return verification requirement", async () => {
			const userData = {
				name: "Test",
				email: "test@example.com",
				password: "password",
			};
			authRepository.findUserByEmail.mockResolvedValue(null);
			emailProvider.generateEmailVerificationToken.mockReturnValue({
				token: "plain-token",
				tokenHash: "hashed-token",
				expiresAt: new Date("2030-01-01"),
			});

			const mockUser = {
				_id: "1",
				name: "Test",
				email: userData.email,
				isEmailVerified: false,
				role: "customer",
				toObject: () => ({
					_id: "1",
					name: "Test",
					email: userData.email,
					isEmailVerified: false,
					role: "customer",
					password: "hashed_pass",
				}),
			};
			authRepository.createUser.mockResolvedValue(mockUser);
			emailProvider.sendVerificationEmail.mockResolvedValue({ sent: true });

			const result = await authService.registerUser(userData);

			expect(authRepository.createUser).toHaveBeenCalledWith(
				expect.objectContaining({
					email: userData.email,
					isEmailVerified: false,
					emailVerificationTokenHash: "hashed-token",
				})
			);
			expect(emailProvider.sendVerificationEmail).toHaveBeenCalledWith(
				expect.objectContaining({
					email: userData.email,
					token: "plain-token",
				})
			);
			expect(result.requiresEmailVerification).toBe(true);
			expect(result.user.password).toBeUndefined();
		});

		it("should throw error if email exists", async () => {
			authRepository.findUserByEmail.mockResolvedValue({ _id: "1" });
			await expect(
				authService.registerUser({ email: "test@example.com" })
			).rejects.toThrow(ApiError);
		});
	});

	describe("loginUser", () => {
		it("should return user and token for valid credentials", async () => {
			const credentials = { email: "test@example.com", password: "password" };
			const mockUser = {
				_id: "1",
				email: credentials.email,
				password: "hashed_pass",
				isEmailVerified: true,
				role: "customer",
				toObject: () => ({
					_id: "1",
					email: credentials.email,
					isEmailVerified: true,
					role: "customer",
					password: "hashed_pass",
				}),
			};
			authRepository.findUserByEmail.mockResolvedValue(mockUser);
			bcrypt.compare.mockResolvedValue(true);
			jwt.sign.mockReturnValue("token123");

			const result = await authService.loginUser(credentials);

			expect(result.token).toBe("token123");
			expect(result.user.password).toBeUndefined();
		});

		it("should throw error for invalid credentials", async () => {
			authRepository.findUserByEmail.mockResolvedValue(null);
			await expect(
				authService.loginUser({ email: "wrong@test.com", password: "any" })
			).rejects.toThrow(ApiError);
		});

		it("should throw if email is not verified", async () => {
			authRepository.findUserByEmail.mockResolvedValue({
				_id: "1",
				email: "test@example.com",
				password: "hashed_pass",
				isEmailVerified: false,
				toObject: () => ({
					_id: "1",
					email: "test@example.com",
					isEmailVerified: false,
				}),
			});
			bcrypt.compare.mockResolvedValue(true);

			await expect(
				authService.loginUser({
					email: "test@example.com",
					password: "password",
				})
			).rejects.toMatchObject({
				code: "AUTH.EMAIL_NOT_VERIFIED",
			});
		});

		it("should throw when user is restricted", async () => {
			authRepository.findUserByEmail.mockResolvedValue({
				_id: "1",
				email: "test@example.com",
				password: "hashed_pass",
				isRestricted: true,
				isEmailVerified: true,
				toObject: () => ({
					_id: "1",
					email: "test@example.com",
					isRestricted: true,
				}),
			});

			await expect(
				authService.loginUser({ email: "test@example.com", password: "password" })
			).rejects.toMatchObject({
				code: "AUTH.USER_RESTRICTED",
			});
		});

		it("should throw when user is soft deleted", async () => {
			authRepository.findUserByEmail.mockResolvedValue({
				_id: "1",
				email: "test@example.com",
				password: "hashed_pass",
				deletedAt: new Date(),
				isEmailVerified: true,
				toObject: () => ({
					_id: "1",
					email: "test@example.com",
					deletedAt: new Date(),
				}),
			});

			await expect(
				authService.loginUser({ email: "test@example.com", password: "password" })
			).rejects.toMatchObject({
				code: "AUTH.USER_DELETED",
			});
		});
	});

	describe("verifyEmailByToken", () => {
		it("should verify email for a valid token", async () => {
			emailProvider.hashVerificationToken.mockReturnValue("token-hash");
			authRepository.findUserByEmailVerificationTokenHash.mockResolvedValue({
				_id: "u1",
				emailVerificationTokenExpiresAt: new Date(Date.now() + 60_000),
			});
			authRepository.verifyUserEmail.mockResolvedValue({
				_id: "u1",
				email: "verified@test.com",
				toObject: () => ({ _id: "u1", email: "verified@test.com" }),
			});

			const result = await authService.verifyEmailByToken("plain-token");

			expect(emailProvider.hashVerificationToken).toHaveBeenCalledWith(
				"plain-token"
			);
			expect(authRepository.verifyUserEmail).toHaveBeenCalledWith("u1");
			expect(result).toMatchObject({ verified: true });
		});

		it("should throw for invalid token", async () => {
			emailProvider.hashVerificationToken.mockReturnValue("token-hash");
			authRepository.findUserByEmailVerificationTokenHash.mockResolvedValue(null);

			await expect(
				authService.verifyEmailByToken("invalid-token")
			).rejects.toMatchObject({
				code: "AUTH.INVALID_VERIFICATION_TOKEN",
			});
		});

		it("should throw for expired token", async () => {
			emailProvider.hashVerificationToken.mockReturnValue("token-hash");
			authRepository.findUserByEmailVerificationTokenHash.mockResolvedValue({
				_id: "u1",
				emailVerificationTokenExpiresAt: new Date(Date.now() - 60_000),
			});

			await expect(
				authService.verifyEmailByToken("expired-token")
			).rejects.toMatchObject({
				code: "AUTH.VERIFICATION_TOKEN_EXPIRED",
			});
		});
	});

	describe("requestEmailOtp", () => {
		it("should generate and send email otp", async () => {
			authRepository.findUserByEmail.mockResolvedValue({
				_id: "u1",
				email: "test@example.com",
				name: "Test",
				isEmailVerified: true,
				toObject: () => ({ _id: "u1", email: "test@example.com" }),
			});
			emailProvider.generateEmailOtpToken.mockReturnValue({
				otp: "123456",
				otpHash: "otp-hash",
				expiresAt: new Date("2030-01-01"),
			});
			authRepository.setEmailOtp.mockResolvedValue({ _id: "u1" });
			emailProvider.sendEmailOtp.mockResolvedValue({ sent: true });

			const result = await authService.requestEmailOtp({
				email: "test@example.com",
			});

			expect(authRepository.setEmailOtp).toHaveBeenCalledWith(
				"u1",
				"otp-hash",
				expect.any(Date)
			);
			expect(emailProvider.sendEmailOtp).toHaveBeenCalledWith(
				expect.objectContaining({ email: "test@example.com", otp: "123456" })
			);
			expect(result.otpRequested).toBe(true);
		});

		it("should reject unknown email", async () => {
			authRepository.findUserByEmail.mockResolvedValue(null);

			await expect(
				authService.requestEmailOtp({ email: "missing@example.com" })
			).rejects.toMatchObject({
				code: "AUTH.INVALID_EMAIL_OTP",
			});
		});
	});

	describe("loginWithEmailOtp", () => {
		it("should login successfully with valid otp", async () => {
			authRepository.findUserByEmailWithOtp.mockResolvedValue({
				_id: "u1",
				email: "test@example.com",
				role: "customer",
				tokenVersion: 0,
				emailOtpHash: "otp-hash",
				emailOtpExpiresAt: new Date(Date.now() + 60_000),
				toObject: () => ({
					_id: "u1",
					email: "test@example.com",
					role: "customer",
					tokenVersion: 0,
				}),
			});
			emailProvider.hashEmailOtp.mockReturnValue("otp-hash");
			authRepository.consumeEmailOtp.mockResolvedValue({
				_id: "u1",
				email: "test@example.com",
				role: "customer",
				tokenVersion: 0,
				toObject: () => ({
					_id: "u1",
					email: "test@example.com",
					role: "customer",
					tokenVersion: 0,
				}),
			});
			jwt.sign.mockReturnValue("otp-token");

			const result = await authService.loginWithEmailOtp({
				email: "test@example.com",
				otp: "123456",
			});

			expect(result.token).toBe("otp-token");
			expect(authRepository.consumeEmailOtp).toHaveBeenCalledWith("u1");
		});

		it("should reject invalid otp", async () => {
			authRepository.findUserByEmailWithOtp.mockResolvedValue({
				_id: "u1",
				emailOtpHash: "correct",
				emailOtpExpiresAt: new Date(Date.now() + 60_000),
				toObject: () => ({ _id: "u1" }),
			});
			emailProvider.hashEmailOtp.mockReturnValue("wrong");

			await expect(
				authService.loginWithEmailOtp({
					email: "test@example.com",
					otp: "111111",
				})
			).rejects.toMatchObject({
				code: "AUTH.INVALID_EMAIL_OTP",
			});
		});
	});

	describe("logoutUser", () => {
		it("should increment token version and return logout acknowledgment", async () => {
			authRepository.findUserById.mockResolvedValue({ _id: "u1" });
			authRepository.incrementTokenVersion.mockResolvedValue({
				_id: "u1",
				tokenVersion: 1,
			});

			const result = await authService.logoutUser({ id: "u1" });

			expect(authRepository.findUserById).toHaveBeenCalledWith("u1");
			expect(authRepository.incrementTokenVersion).toHaveBeenCalledWith("u1");
			expect(result).toEqual({ loggedOut: true });
		});

		it("should throw not found when user does not exist", async () => {
			authRepository.findUserById.mockResolvedValue(null);

			await expect(
				authService.logoutUser({ id: "missing" })
			).rejects.toMatchObject({
				code: "AUTH.USER_NOT_FOUND",
			});
		});
	});

	describe("handleGoogleCallback", () => {
		it("should create user if not found and return token", async () => {
			const profile = {
				id: "g123",
				displayName: "G User",
				emails: [{ value: "g@test.com" }],
			};
			authRepository.findUserByGoogleId.mockResolvedValue(null);
			authRepository.findUserByEmail.mockResolvedValue(null);
			const mockUser = {
				_id: "2",
				email: "g@test.com",
				isEmailVerified: true,
				role: "customer",
				toObject: () => ({
					_id: "2",
					email: "g@test.com",
					isEmailVerified: true,
					role: "customer",
				}),
			};
			authRepository.createUser.mockResolvedValue(mockUser);
			jwt.sign.mockReturnValue("gtoken");

			const result = await authService.handleGoogleCallback(profile);

			expect(authRepository.createUser).toHaveBeenCalled();
			expect(authRepository.findUserByEmail).toHaveBeenCalledWith("g@test.com");
			expect(result.token).toBe("gtoken");
		});

		it("should attach googleId when email already exists", async () => {
			const profile = {
				id: "google-new",
				displayName: "G User",
				emails: [{ value: "existing@test.com" }],
			};
			const existingUser = {
				_id: "3",
				email: "existing@test.com",
				isEmailVerified: true,
				role: "customer",
				password: "hashed_pass",
				toObject: () => ({
					_id: "3",
					email: "existing@test.com",
					isEmailVerified: true,
					role: "customer",
					password: "hashed_pass",
				}),
			};

			authRepository.findUserByGoogleId.mockResolvedValue(null);
			authRepository.findUserByEmail.mockResolvedValue(existingUser);
			authRepository.attachGoogleIdToUser.mockResolvedValue(existingUser);
			jwt.sign.mockReturnValue("linked-token");

			const result = await authService.handleGoogleCallback(profile);

			expect(authRepository.createUser).not.toHaveBeenCalled();
			expect(authRepository.attachGoogleIdToUser).toHaveBeenCalledWith(
				existingUser._id,
				"google-new"
			);
			expect(result.token).toBe("linked-token");
		});

		it("should return existing user if found", async () => {
			const profile = {
				id: "g123",
				displayName: "G User",
				emails: [{ value: "g@test.com" }],
			};
			const mockUser = {
				_id: "2",
				email: "g@test.com",
				isEmailVerified: true,
				role: "customer",
				toObject: () => ({
					_id: "2",
					email: "g@test.com",
					isEmailVerified: true,
					role: "customer",
				}),
			};
			authRepository.findUserByGoogleId.mockResolvedValue(mockUser);
			jwt.sign.mockReturnValue("gtoken");

			const result = await authService.handleGoogleCallback(profile);

			expect(authRepository.createUser).not.toHaveBeenCalled();
			expect(result.token).toBe("gtoken");
		});

		it("should throw bad request when email is missing", async () => {
			const profile = {
				id: "g123",
				displayName: "G User",
				emails: [],
			};

			authRepository.findUserByGoogleId.mockResolvedValue(null);

			await expect(
				authService.handleGoogleCallback(profile)
			).rejects.toMatchObject({
				code: "AUTH.GOOGLE_EMAIL_MISSING",
			});
		});

		it("should map duplicate key error to account conflict", async () => {
			const profile = {
				id: "g123",
				displayName: "G User",
				emails: [{ value: "g@test.com" }],
			};

			authRepository.findUserByGoogleId.mockResolvedValue(null);
			authRepository.findUserByEmail.mockResolvedValue(null);
			authRepository.createUser.mockRejectedValue({ code: 11_000 });

			await expect(
				authService.handleGoogleCallback(profile)
			).rejects.toMatchObject({
				code: "AUTH.GOOGLE_ACCOUNT_CONFLICT",
			});
		});

		it("should map mongoose validation error", async () => {
			const profile = {
				id: "g123",
				displayName: "G User",
				emails: [{ value: "g@test.com" }],
			};

			authRepository.findUserByGoogleId.mockResolvedValue(null);
			authRepository.findUserByEmail.mockResolvedValue(null);
			authRepository.createUser.mockRejectedValue({
				name: "ValidationError",
				message: "Name is required",
			});

			await expect(
				authService.handleGoogleCallback(profile)
			).rejects.toMatchObject({
				code: "AUTH.GOOGLE_USER_VALIDATION_FAILED",
			});
		});

		it("should map mongoose cast error", async () => {
			const profile = {
				id: "g123",
				displayName: "G User",
				emails: [{ value: "g@test.com" }],
			};

			authRepository.findUserByGoogleId.mockResolvedValue(null);
			authRepository.findUserByEmail.mockResolvedValue(null);
			authRepository.createUser.mockRejectedValue({
				name: "CastError",
				message: "Cast to ObjectId failed",
			});

			await expect(
				authService.handleGoogleCallback(profile)
			).rejects.toMatchObject({
				code: "AUTH.GOOGLE_USER_INVALID_DATA",
			});
		});
	});
});
