import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as authRepository from "../../../src/modules/auth/auth.repository.js";
import * as authService from "../../../src/modules/auth/auth.service.js";
import { ApiError } from "../../../src/utils/errors/api-error.js";

vi.mock("../../../src/modules/auth/auth.repository.js");
vi.mock("bcryptjs");
vi.mock("jsonwebtoken");

describe("Auth Service", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("registerUser", () => {
		it("should create a user and return token", async () => {
			const userData = {
				name: "Test",
				email: "test@example.com",
				password: "password",
			};
			authRepository.findUserByEmail.mockResolvedValue(null);

			const mockUser = {
				_id: "1",
				email: userData.email,
				role: "member",
				toObject: () => ({
					_id: "1",
					email: userData.email,
					role: "member",
					password: "hashed_pass",
				}),
			};
			authRepository.createUser.mockResolvedValue(mockUser);
			jwt.sign.mockReturnValue("token123");

			const result = await authService.registerUser(userData);

			expect(authRepository.createUser).toHaveBeenCalledWith(
				expect.objectContaining({ email: userData.email })
			);
			expect(result.token).toBe("token123");
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
				role: "member",
				toObject: () => ({
					_id: "1",
					email: credentials.email,
					role: "member",
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
	});

	describe("handleGoogleCallback", () => {
		it("should create user if not found and return token", async () => {
			const profile = {
				id: "g123",
				displayName: "G User",
				emails: [{ value: "g@test.com" }],
			};
			authRepository.findUserByGoogleId.mockResolvedValue(null);
			const mockUser = {
				_id: "2",
				email: "g@test.com",
				role: "member",
				toObject: () => ({ _id: "2", email: "g@test.com", role: "member" }),
			};
			authRepository.createUser.mockResolvedValue(mockUser);
			jwt.sign.mockReturnValue("gtoken");

			const result = await authService.handleGoogleCallback(profile);

			expect(authRepository.createUser).toHaveBeenCalled();
			expect(result.token).toBe("gtoken");
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
				role: "member",
				toObject: () => ({ _id: "2", email: "g@test.com", role: "member" }),
			};
			authRepository.findUserByGoogleId.mockResolvedValue(mockUser);
			jwt.sign.mockReturnValue("gtoken");

			const result = await authService.handleGoogleCallback(profile);

			expect(authRepository.createUser).not.toHaveBeenCalled();
			expect(result.token).toBe("gtoken");
		});
	});
});
