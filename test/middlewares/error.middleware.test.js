import { StatusCodes } from "http-status-codes";
import { describe, expect, it } from "vitest";
import { ZodError } from "zod";
import { errorHandler } from "../../src/middlewares/error.middleware.js";
import { ApiError } from "../../src/utils/errors/api-error.js";

const createRes = () => {
	const res = {
		statusCode: StatusCodes.OK,
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
const noop = () => {
	// noop
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

		errorHandler(zodError, {}, res, noop);

		expect(res.statusCode).toBe(StatusCodes.BAD_REQUEST);
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
			ApiError.notFound({
				code: "NOT_FOUND",
				message: "Route not found",
			}),
			{},
			res,
			noop
		);

		expect(res.statusCode).toBe(StatusCodes.NOT_FOUND);
		expect(res.body).toEqual({
			success: false,
			error: { code: "NOT_FOUND" },
			message: "Route not found",
		});
	});

	it("falls back to internal server error code", () => {
		const res = createRes();

		errorHandler(new Error("boom"), {}, res, noop);

		expect(res.statusCode).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
		expect(res.body).toEqual({
			success: false,
			error: { code: "INTERNAL_SERVER_ERROR" },
			message: "boom",
		});
	});

	it("normalizes invalid statusCode and empty code", () => {
		const res = createRes();

		errorHandler(
			{ statusCode: 700, code: "   ", message: "Unknown failure" },
			{},
			res,
			noop
		);

		expect(res.statusCode).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
		expect(res.body).toEqual({
			success: false,
			error: { code: "INTERNAL_SERVER_ERROR" },
			message: "Unknown failure",
		});
	});

	it("hides 500 internal message in production mode", () => {
		const res = createRes();
		const previousNodeEnv = process.env.NODE_ENV;
		process.env.NODE_ENV = "production";

		try {
			errorHandler(new Error("database credentials leaked"), {}, res, noop);
		} finally {
			process.env.NODE_ENV = previousNodeEnv;
		}

		expect(res.statusCode).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
		expect(res.body).toEqual({
			success: false,
			error: { code: "INTERNAL_SERVER_ERROR" },
			message: "Internal server error",
		});
	});

	it("omits details for 500-level errors", () => {
		const res = createRes();

		errorHandler(
			{
				statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
				code: "INTERNAL_FAILURE",
				message: "failure",
				details: { stack: "..." },
			},
			{},
			res,
			noop
		);

		expect(res.body).toEqual({
			success: false,
			error: { code: "INTERNAL_FAILURE" },
			message: "failure",
		});
	});
});
