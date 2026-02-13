import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { requireAuth } from "../../src/middlewares/auth.middleware.js";

const next = vi.fn();

beforeEach(() => {
	next.mockReset();
	process.env.JWT_SECRET = "a".repeat(32);
});

describe("auth middleware", () => {
	it("returns unauthorized when authorization header is missing", () => {
		const req = { headers: {} };

		requireAuth(req, {}, next);

		expect(next).toHaveBeenCalledTimes(1);
		expect(next).toHaveBeenCalledWith(
			expect.objectContaining({
				statusCode: StatusCodes.UNAUTHORIZED,
				code: "UNAUTHORIZED",
			})
		);
	});

	it("returns unauthorized when token is invalid", () => {
		const req = { headers: { authorization: "Bearer invalid-token" } };

		requireAuth(req, {}, next);

		expect(next).toHaveBeenCalledWith(
			expect.objectContaining({
				statusCode: StatusCodes.UNAUTHORIZED,
				code: "UNAUTHORIZED",
			})
		);
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
