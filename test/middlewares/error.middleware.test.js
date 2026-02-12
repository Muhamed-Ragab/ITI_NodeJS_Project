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
	it("returns 400 payload for zod errors", () => {
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
		expect(res.body).toMatchObject({
			success: false,
			message: "Validation failed",
		});
		expect(res.body.details[0]).toMatchObject({
			path: "email",
			code: "invalid_type",
		});
	});

	it("uses statusCode/message from known application errors", () => {
		const res = createRes();

		errorHandler(
			{ statusCode: 404, message: "Route not found" },
			{},
			res,
			() => {}
		);

		expect(res.statusCode).toBe(404);
		expect(res.body).toEqual({
			success: false,
			message: "Route not found",
		});
	});

	it("falls back to safe 500 response for unknown errors", () => {
		const res = createRes();

		errorHandler(new Error("boom"), {}, res, () => {});

		expect(res.statusCode).toBe(500);
		expect(res.body).toEqual({
			success: false,
			message: "boom",
		});
	});
});
