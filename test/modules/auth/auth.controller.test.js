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
	let req, res, next;

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
		next = vi.fn();
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

			await authController.register(req, res, next);

			expect(authService.registerUser).toHaveBeenCalledWith(req.body);
			expect(sendSuccess).toHaveBeenCalledWith(
				res,
				expect.objectContaining({
					statusCode: StatusCodes.CREATED,
					data: mockResult,
				})
			);
		});

		it("should call next with error if service fails", async () => {
			const error = ApiError.badRequest({ message: "Email exists" });
			authService.registerUser.mockRejectedValue(error);

			await authController.register(req, res, next);

			expect(next).toHaveBeenCalledWith(error);
		});
	});

	describe("login", () => {
		it("should login a user and return 200", async () => {
			req.body = { email: "test@example.com", password: "password123" };
			const mockResult = { user: { id: "1" }, token: "mock_token" };
			authService.loginUser.mockResolvedValue(mockResult);

			await authController.login(req, res, next);

			expect(authService.loginUser).toHaveBeenCalledWith(req.body);
			expect(sendSuccess).toHaveBeenCalledWith(
				res,
				expect.objectContaining({
					statusCode: StatusCodes.OK,
					data: mockResult,
				})
			);
		});

		it("should call next with error if login fails", async () => {
			const error = ApiError.unauthorized({ message: "Invalid credentials" });
			authService.loginUser.mockRejectedValue(error);

			await authController.login(req, res, next);

			expect(next).toHaveBeenCalledWith(error);
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
		it("should complete google login and return 200", async () => {
			req.query = { code: "mock_code" };
			const mockResult = { user: { id: "1" }, token: "mock_token" };
			authService.handleGoogleCallback.mockResolvedValue(mockResult);

			await authController.googleCallback(req, res, next);

			expect(authService.handleGoogleCallback).toHaveBeenCalled();
			expect(sendSuccess).toHaveBeenCalledWith(
				res,
				expect.objectContaining({
					statusCode: StatusCodes.OK,
					data: mockResult,
				})
			);
		});
	});
});
