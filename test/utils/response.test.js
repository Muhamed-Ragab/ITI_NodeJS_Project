import { StatusCodes } from "http-status-codes";
import { describe, expect, it } from "vitest";
import { sendError, sendSuccess } from "../../src/utils/response.js";

const createRes = () => ({
	statusCode: 0,
	payload: undefined,
	status(code) {
		this.statusCode = code;
		return this;
	},
	json(data) {
		this.payload = data;
		return this;
	},
});

describe("response helpers", () => {
	it("sendSuccess returns default success envelope", () => {
		const res = createRes();
		sendSuccess(res);

		expect(res.statusCode).toBe(StatusCodes.OK);
		expect(res.payload).toEqual({
			success: true,
			data: null,
		});
	});

	it("sendError returns default error envelope", () => {
		const res = createRes();
		sendError(res);

		expect(res.statusCode).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
		expect(res.payload).toEqual({
			success: false,
			error: { code: "INTERNAL_SERVER_ERROR" },
		});
	});

	it("sendError includes details and message when provided", () => {
		const res = createRes();
		sendError(res, {
			statusCode: StatusCodes.BAD_REQUEST,
			code: "VALIDATION_ERROR",
			details: [{ field: "email" }],
			message: "Validation failed",
		});

		expect(res.payload).toEqual({
			success: false,
			error: {
				code: "VALIDATION_ERROR",
				details: [{ field: "email" }],
			},
			message: "Validation failed",
		});
	});
});
