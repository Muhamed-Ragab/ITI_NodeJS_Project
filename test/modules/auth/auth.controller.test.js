import { StatusCodes } from "http-status-codes";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as authController from "../../../src/modules/auth/auth.controller.js";
import * as authService from "../../../src/modules/auth/auth.service.js";
import { ApiError } from "../../../src/utils/errors/api-error.js";
import { sendSuccess } from "../../../src/utils/response.js";

vi.mock("../../../src/modules/auth/auth.service.js");
vi.mock("../../../src/utils/response.js", () => ({
	sendSuccess: vi.fn(),
	sendError: vi.fn(),
}));

describe("Auth Controller", () => {
	let req, res;

	beforeEach(() => {
		vi.clearAllMocks();
		req = {
			body: {},
			query: {},
		};
		res = {
			status: vi.fn().mockReturnThis(),
			json: vi.fn().mockReturnThis(),
			redirect: vi.fn(),
		};
	});

	describe("register", () => {
		it("should register a user and return 201", async () => {
			req.body = {
				name: "Test User",
				email: "test@example.com",
				password: "password123",
			};
			const mockResult = {
				user: { id: "1", ...req.body },
				token: "mock_token",
			};
			authService.registerUser.mockResolvedValue(mockResult);

			await authController.register(req, res);

			expect(authService.registerUser).toHaveBeenCalledWith(req.body);
			expect(sendSuccess).toHaveBeenCalledWith(
				res,
				expect.objectContaining({
					statusCode: StatusCodes.CREATED,
					data: mockResult,
				})
			);
		});

		it("should throw if service fails", async () => {
			const error = ApiError.badRequest({ message: "Email exists" });
			authService.registerUser.mockRejectedValue(error);

			await expect(authController.register(req, res)).rejects.toBe(error);
		});
	});

	describe("login", () => {
		it("should login a user and return 200", async () => {
			req.body = { email: "test@example.com", password: "password123" };
			const mockResult = { user: { id: "1" }, token: "mock_token" };
			authService.loginUser.mockResolvedValue(mockResult);

			await authController.login(req, res);

			expect(authService.loginUser).toHaveBeenCalledWith(req.body);
			expect(sendSuccess).toHaveBeenCalledWith(
				res,
				expect.objectContaining({
					statusCode: StatusCodes.OK,
					data: mockResult,
				})
			);
		});

		it("should throw if login fails", async () => {
			const error = ApiError.unauthorized({ message: "Invalid credentials" });
			authService.loginUser.mockRejectedValue(error);

			await expect(authController.login(req, res)).rejects.toBe(error);
		});
	});

	describe("requestEmailOtp", () => {
		it("should request email otp and return 200", async () => {
			req.body = { email: "test@example.com" };
			authService.requestEmailOtp.mockResolvedValue({ otpRequested: true });

			await authController.requestEmailOtp(req, res);

			expect(authService.requestEmailOtp).toHaveBeenCalledWith(req.body);
			expect(sendSuccess).toHaveBeenCalledWith(
				res,
				expect.objectContaining({
					statusCode: StatusCodes.OK,
					data: { otpRequested: true },
				})
			);
		});
	});

	describe("loginWithEmailOtp", () => {
		it("should login with email otp and return 200", async () => {
			req.body = { email: "test@example.com", otp: "123456" };
			const mockResult = { user: { id: "u1" }, token: "mock_token" };
			authService.loginWithEmailOtp.mockResolvedValue(mockResult);

			await authController.loginWithEmailOtp(req, res);

			expect(authService.loginWithEmailOtp).toHaveBeenCalledWith(req.body);
			expect(sendSuccess).toHaveBeenCalledWith(
				res,
				expect.objectContaining({
					statusCode: StatusCodes.OK,
					data: mockResult,
				})
			);
		});
	});

	describe("logout", () => {
		it("should logout authenticated user and return 200", async () => {
			req.user = { id: "u1", role: "customer" };
			authService.logoutUser.mockResolvedValue({ loggedOut: true });

			await authController.logout(req, res);

			expect(authService.logoutUser).toHaveBeenCalledWith(req.user);
			expect(sendSuccess).toHaveBeenCalledWith(
				res,
				expect.objectContaining({
					statusCode: StatusCodes.OK,
					data: { loggedOut: true },
				})
			);
		});
	});

	describe("googleStart", () => {
		it("should redirect to Google auth URL", () => {
			authController.googleStart(req, res);
			expect(res.redirect).toHaveBeenCalledWith(
				expect.stringContaining("accounts.google.com")
			);
		});
	});

	describe("googleCallback", () => {
		it("should complete google login and redirect to Angular home page", async () => {
			req.query = { code: "mock_code" };
			const mockResult = { user: { id: "1" }, token: "mock_token" };
			authService.handleGoogleCallback.mockResolvedValue(mockResult);

			await authController.googleCallback(req, res);

			expect(authService.handleGoogleCallback).toHaveBeenCalled();
			expect(res.redirect).toHaveBeenCalledWith(
				expect.stringContaining("/home?token=")
			);
		});
	});

	describe("verifyEmail", () => {
		it("should verify email and redirect to Angular home page", async () => {
			req.query = { token: "verification-token" };
			authService.verifyEmailByToken.mockResolvedValue({ verified: true });

			await authController.verifyEmail(req, res);

			expect(authService.verifyEmailByToken).toHaveBeenCalledWith(
				"verification-token"
			);
			expect(res.redirect).toHaveBeenCalledWith(
				expect.stringContaining("/home?verified=true")
			);
		});
	});
});
