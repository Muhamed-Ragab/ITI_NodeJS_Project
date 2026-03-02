import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { requireAuth } from "../../src/middlewares/auth.middleware.js";
import * as authRepository from "../../src/modules/auth/auth.repository.js";
import { ApiError } from "../../src/utils/errors/api-error.js";

vi.mock("../../src/modules/auth/auth.repository.js", () => ({
	findUserById: vi.fn(),
}));

const next = vi.fn();

beforeEach(() => {
	next.mockReset();
	process.env.JWT_SECRET = "a".repeat(32);
});

describe("auth middleware", () => {
	it("returns ApiError unauthorized when authorization header is missing", async () => {
		await requireAuth({ headers: {} }, {}, next);

		expect(next).toHaveBeenCalledTimes(1);
		const [error] = next.mock.calls[0];
		expect(error).toBeInstanceOf(ApiError);
		expect(error.statusCode).toBe(StatusCodes.UNAUTHORIZED);
		expect(error.code).toBe("UNAUTHORIZED");
	});

	it("returns ApiError unauthorized when token is invalid", async () => {
		await requireAuth({ headers: { authorization: "Bearer bad" } }, {}, next);

		const [error] = next.mock.calls[0];
		expect(error).toBeInstanceOf(ApiError);
		expect(error.statusCode).toBe(StatusCodes.UNAUTHORIZED);
	});

	it("attaches decoded user and calls next with no args when token is valid", async () => {
		const token = jwt.sign(
			{ id: "user-1", role: "admin", tokenVersion: 0 },
			process.env.JWT_SECRET
		);
		const req = { headers: { authorization: `Bearer ${token}` } };
		authRepository.findUserById.mockResolvedValue({
			_id: "user-1",
			tokenVersion: 0,
		});

		await requireAuth(req, {}, next);

		expect(req.user).toMatchObject({ id: "user-1", role: "admin" });
		expect(next).toHaveBeenCalledWith();
	});

	it("returns unauthorized when user does not exist in database", async () => {
		const token = jwt.sign(
			{ id: "missing-user", role: "customer", tokenVersion: 0 },
			process.env.JWT_SECRET
		);
		authRepository.findUserById.mockResolvedValue(null);

		await requireAuth(
			{ headers: { authorization: `Bearer ${token}` } },
			{},
			next
		);

		const [error] = next.mock.calls[0];
		expect(error).toBeInstanceOf(ApiError);
		expect(error.code).toBe("AUTH.USER_NOT_FOUND");
		expect(error.statusCode).toBe(StatusCodes.UNAUTHORIZED);
	});

	it("returns unauthorized when token version is revoked", async () => {
		const token = jwt.sign(
			{ id: "user-1", role: "customer", tokenVersion: 0 },
			process.env.JWT_SECRET
		);
		authRepository.findUserById.mockResolvedValue({
			_id: "user-1",
			tokenVersion: 1,
		});

		await requireAuth(
			{ headers: { authorization: `Bearer ${token}` } },
			{},
			next
		);

		const [error] = next.mock.calls[0];
		expect(error).toBeInstanceOf(ApiError);
		expect(error.code).toBe("AUTH.TOKEN_REVOKED");
		expect(error.statusCode).toBe(StatusCodes.UNAUTHORIZED);
	});

	it("returns unauthorized when user is soft deleted", async () => {
		const token = jwt.sign(
			{ id: "user-1", role: "customer", tokenVersion: 0 },
			process.env.JWT_SECRET
		);
		authRepository.findUserById.mockResolvedValue({
			_id: "user-1",
			tokenVersion: 0,
			deletedAt: new Date(),
		});

		await requireAuth(
			{ headers: { authorization: `Bearer ${token}` } },
			{},
			next
		);

		const [error] = next.mock.calls[0];
		expect(error).toBeInstanceOf(ApiError);
		expect(error.code).toBe("AUTH.USER_DELETED");
		expect(error.statusCode).toBe(StatusCodes.UNAUTHORIZED);
	});

	it("returns forbidden when user is restricted", async () => {
		const token = jwt.sign(
			{ id: "user-1", role: "customer", tokenVersion: 0 },
			process.env.JWT_SECRET
		);
		authRepository.findUserById.mockResolvedValue({
			_id: "user-1",
			tokenVersion: 0,
			isRestricted: true,
		});

		await requireAuth(
			{ headers: { authorization: `Bearer ${token}` } },
			{},
			next
		);

		const [error] = next.mock.calls[0];
		expect(error).toBeInstanceOf(ApiError);
		expect(error.code).toBe("AUTH.USER_RESTRICTED");
		expect(error.statusCode).toBe(StatusCodes.FORBIDDEN);
	});
});
