import { StatusCodes } from "http-status-codes";
import { describe, expect, it, vi } from "vitest";
import { requireRole } from "../../src/middlewares/role.middleware.js";

describe("role middleware", () => {
	it("returns unauthorized when req.user is missing", () => {
		const middleware = requireRole("admin");
		const next = vi.fn();

		middleware({}, {}, next);

		expect(next).toHaveBeenCalledWith(
			expect.objectContaining({
				statusCode: StatusCodes.UNAUTHORIZED,
				code: "UNAUTHORIZED",
			})
		);
	});

	it("returns forbidden when user role is not allowed", () => {
		const middleware = requireRole("admin");
		const next = vi.fn();
		const req = { user: { role: "member" } };

		middleware(req, {}, next);

		expect(next).toHaveBeenCalledWith(
			expect.objectContaining({
				statusCode: StatusCodes.FORBIDDEN,
				code: "FORBIDDEN",
			})
		);
	});

	it("calls next with no args when user role is allowed", () => {
		const middleware = requireRole("admin", "seller");
		const next = vi.fn();
		const req = { user: { role: "admin" } };

		middleware(req, {}, next);

		expect(next).toHaveBeenCalledWith();
	});
});
