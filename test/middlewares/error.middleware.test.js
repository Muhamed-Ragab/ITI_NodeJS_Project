import { describe, expect, it } from "vitest";
import { ZodError } from "zod";
import { errorHandler } from "../../src/middlewares/error.middleware.js";

const createRes = () => {
	const res = {
		statusCode: 200,
		body: undefined,
		status(code) {
			this.statusCode = code;
			return this;
		},
		json(payload) {
			this.body = payload;
			return this;
		},
	};

	return res;
};

describe("error middleware", () => {
	it("returns 400 envelope for zod errors", () => {
		const res = createRes();
		const zodError = new ZodError([
			{
				code: "invalid_type",
				expected: "string",
				received: "undefined",
				path: ["email"],
				message: "Invalid input: expected string, received undefined",
			},
		]);

		errorHandler(zodError, {}, res, () => {});

		expect(res.statusCode).toBe(400);
		expect(res.body.success).toBe(false);
		expect(res.body.message).toBe("Validation failed");
		expect(res.body.error.code).toBe("VALIDATION_ERROR");
		expect(res.body.error.details[0]).toMatchObject({
			path: "email",
			code: "invalid_type",
		});
	});

	it("uses statusCode and code from known errors", () => {
		const res = createRes();

		errorHandler(
			{ statusCode: 404, code: "NOT_FOUND", message: "Route not found" },
			{},
			res,
			() => {}
		);

		expect(res.statusCode).toBe(404);
		expect(res.body).toEqual({
			success: false,
			error: { code: "NOT_FOUND" },
			message: "Route not found",
		});
	});

	it("falls back to internal server error code", () => {
		const res = createRes();

		errorHandler(new Error("boom"), {}, res, () => {});

		expect(res.statusCode).toBe(500);
		expect(res.body).toEqual({
			success: false,
			error: { code: "INTERNAL_SERVER_ERROR" },
			message: "boom",
		});
	});
});
