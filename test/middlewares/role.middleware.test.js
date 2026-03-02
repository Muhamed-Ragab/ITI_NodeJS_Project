import { StatusCodes } from "http-status-codes";
import { describe, expect, it, vi } from "vitest";
import { requireRole } from "../../src/middlewares/role.middleware.js";
import { ApiError } from "../../src/utils/errors/api-error.js";

describe("role middleware", () => {
	it("returns unauthorized when req.user is missing", () => {
		const middleware = requireRole("admin");
		const next = vi.fn();

		middleware({}, {}, next);

		const [error] = next.mock.calls[0];
		expect(error).toBeInstanceOf(ApiError);
		expect(error.statusCode).toBe(StatusCodes.UNAUTHORIZED);
	});

	it("returns forbidden when role is not allowed", () => {
		const middleware = requireRole("admin");
		const next = vi.fn();

		middleware({ user: { role: "customer" } }, {}, next);

		const [error] = next.mock.calls[0];
		expect(error).toBeInstanceOf(ApiError);
		expect(error.statusCode).toBe(StatusCodes.FORBIDDEN);
	});

	it("allows request when role is allowed", () => {
		const middleware = requireRole("admin", "seller");
		const next = vi.fn();

		middleware({ user: { role: "admin" } }, {}, next);

		expect(next).toHaveBeenCalledWith();
	});
});
