import { StatusCodes } from "http-status-codes";
import { describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { validate } from "../../src/middlewares/validate.middleware.js";

describe("validate middleware", () => {
	it("parses and replaces req.body when schema is valid", async () => {
		const middleware = validate({
			body: z.object({
				name: z.string().trim(),
			}),
		});
		const req = { body: { name: "  Alice  " } };
		const next = vi.fn();

		await middleware(req, {}, next);

		expect(req.body).toEqual({ name: "Alice" });
		expect(next).toHaveBeenCalledWith();
	});

	it("forwards zod errors with 400 statusCode and validation code", async () => {
		const middleware = validate({
			body: z.object({ email: z.string().email() }),
		});
		const req = { body: { email: "bad-email" } };
		const next = vi.fn();

		await middleware(req, {}, next);

		expect(next).toHaveBeenCalledTimes(1);
		const [error] = next.mock.calls[0];
		expect(error).toBeDefined();
		expect(error.statusCode).toBe(StatusCodes.BAD_REQUEST);
		expect(error.code).toBe("VALIDATION_ERROR");
	});

	it("validates req.query when it is a getter-only property", async () => {
		const middleware = validate({
			query: z.object({ code: z.string().min(1) }),
		});

		const req = {};
		Object.defineProperty(req, "query", {
			get() {
				return { code: "google-auth-code" };
			},
			configurable: true,
			enumerable: true,
		});
		const next = vi.fn();

		await middleware(req, {}, next);

		expect(req.query).toEqual({ code: "google-auth-code" });
		expect(next).toHaveBeenCalledWith();
	});

	it("forwards validation error when query validation fails", async () => {
		const middleware = validate({
			query: z.object({ code: z.string().min(1) }),
		});

		const req = {};
		Object.defineProperty(req, "query", {
			get() {
				return {};
			},
			configurable: true,
			enumerable: true,
		});
		const next = vi.fn();

		await middleware(req, {}, next);

		const [error] = next.mock.calls[0];
		expect(error.statusCode).toBe(StatusCodes.BAD_REQUEST);
		expect(error.code).toBe("VALIDATION_ERROR");
	});
});
