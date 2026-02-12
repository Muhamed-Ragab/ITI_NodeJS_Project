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

	const statusCode =
		typeof error?.statusCode === "number" ? error.statusCode : 500;
	const code =
		typeof error?.code === "string" ? error.code : "INTERNAL_SERVER_ERROR";
	const message =
		typeof error?.message === "string" && error.message.trim().length > 0
			? error.message
			: "Internal server error";
	const details =
		isObject(error?.details) || Array.isArray(error?.details)
			? error.details
			: undefined;

	return sendError(res, {
		statusCode,
		code,
		message,
		details,
	});
};
