import { StatusCodes } from "http-status-codes";
import { describe, expect, it } from "vitest";
import { ApiError } from "../../src/utils/errors/api-error.js";

describe("ApiError", () => {
	it("builds default internal error", () => {
		const error = new ApiError();

		expect(error.statusCode).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
		expect(error.code).toBe("INTERNAL_SERVER_ERROR");
		expect(error.message).toBe("Internal server error");
		expect(error.isOperational).toBe(true);
	});

	it("creates badRequest via factory", () => {
		const error = ApiError.badRequest({
			code: "VALIDATION_ERROR",
			message: "Validation failed",
			details: [{ path: "email" }],
		});

		expect(error.statusCode).toBe(StatusCodes.BAD_REQUEST);
		expect(error.code).toBe("VALIDATION_ERROR");
		expect(error.details).toEqual([{ path: "email" }]);
	});

	it("creates unauthorized and forbidden errors", () => {
		expect(ApiError.unauthorized().statusCode).toBe(StatusCodes.UNAUTHORIZED);
		expect(ApiError.forbidden().statusCode).toBe(StatusCodes.FORBIDDEN);
	});
});
