import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { requireAuth } from "../../src/middlewares/auth.middleware.js";
import { ApiError } from "../../src/utils/errors/api-error.js";

const next = vi.fn();

beforeEach(() => {
	next.mockReset();
	process.env.JWT_SECRET = "a".repeat(32);
});

describe("auth middleware", () => {
	it("returns ApiError unauthorized when authorization header is missing", () => {
		requireAuth({ headers: {} }, {}, next);

		expect(next).toHaveBeenCalledTimes(1);
		const [error] = next.mock.calls[0];
		expect(error).toBeInstanceOf(ApiError);
		expect(error.statusCode).toBe(StatusCodes.UNAUTHORIZED);
		expect(error.code).toBe("UNAUTHORIZED");
	});

	it("returns ApiError unauthorized when token is invalid", () => {
		requireAuth({ headers: { authorization: "Bearer bad" } }, {}, next);

		const [error] = next.mock.calls[0];
		expect(error).toBeInstanceOf(ApiError);
		expect(error.statusCode).toBe(StatusCodes.UNAUTHORIZED);
	});

	it("attaches decoded user and calls next with no args when token is valid", () => {
		const token = jwt.sign(
			{ sub: "user-1", role: "admin" },
			process.env.JWT_SECRET
		);
		const req = { headers: { authorization: `Bearer ${token}` } };

		requireAuth(req, {}, next);

		expect(req.user).toMatchObject({ sub: "user-1", role: "admin" });
		expect(next).toHaveBeenCalledWith();
	});
});
