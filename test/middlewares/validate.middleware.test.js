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

	it("forwards zod errors with 400 statusCode", async () => {
		const middleware = validate({
			body: z.object({ email: z.string().email() }),
		});
		const req = { body: { email: "bad-email" } };
		const next = vi.fn();

		await middleware(req, {}, next);

		expect(next).toHaveBeenCalledTimes(1);
		const [error] = next.mock.calls[0];
		expect(error).toBeDefined();
		expect(error.statusCode).toBe(400);
	});
});
