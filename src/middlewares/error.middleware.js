import { ZodError } from "zod";

const isObject = (value) => value !== null && typeof value === "object";

const normalizeValidationDetails = (error) =>
	error.issues.map((issue) => ({
		path: issue.path.join("."),
		message: issue.message,
		code: issue.code,
	}));

export const errorHandler = (error, _req, res, _next) => {
	if (error instanceof ZodError) {
		return res.status(400).json({
			success: false,
			message: "Validation failed",
			details: normalizeValidationDetails(error),
		});
	}

	const statusCode =
		typeof error?.statusCode === "number" ? error.statusCode : 500;
	const message =
		typeof error?.message === "string" && error.message.trim().length > 0
			? error.message
			: "Internal server error";
	const details =
		isObject(error?.details) || Array.isArray(error?.details)
			? error.details
			: undefined;

	return res.status(statusCode).json({
		success: false,
		message,
		...(details ? { details } : {}),
	});
};
