import { ZodError } from "zod";
import { sendError } from "../utils/response.js";

const isObject = (value) => value !== null && typeof value === "object";

const normalizeValidationDetails = (error) =>
	error.issues.map((issue) => ({
		path: issue.path.join("."),
		message: issue.message,
		code: issue.code,
	}));

export const errorHandler = (error, _req, res, _next) => {
	if (error instanceof ZodError) {
		return sendError(res, {
			statusCode: 400,
			code: "VALIDATION_ERROR",
			message: "Validation failed",
			details: normalizeValidationDetails(error),
		});
	}

	const statusCode = normalizeStatusCode(error?.statusCode);
	const code = normalizeErrorCode(error?.code);
	const message = normalizeMessage(error?.message, statusCode);
	const details =
		isObject(error?.details) || Array.isArray(error?.details)
			? error.details
			: undefined;

	return sendError(res, {
		statusCode,
		code,
		message,
		details: statusCode < 500 ? details : undefined,
	});
};
