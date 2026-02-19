import { StatusCodes } from "http-status-codes";
import { ZodError } from "zod";
import { ApiError } from "../utils/errors/api-error.js";
import { sendError } from "../utils/response.js";

const isObject = (value) => value !== null && typeof value === "object";
const ERROR_STATUS_MIN = StatusCodes.BAD_REQUEST;
const ERROR_STATUS_MAX = StatusCodes.NETWORK_AUTHENTICATION_REQUIRED;

const normalizeStatusCode = (statusCode) => {
	if (
		typeof statusCode === "number" &&
		Number.isInteger(statusCode) &&
		statusCode >= ERROR_STATUS_MIN &&
		statusCode <= ERROR_STATUS_MAX
	) {
		return statusCode;
	}

	return StatusCodes.INTERNAL_SERVER_ERROR;
};

const normalizeErrorCode = (code) =>
	typeof code === "string" && code.trim().length > 0
		? code.trim().toUpperCase()
		: "INTERNAL_SERVER_ERROR";

const normalizeMessage = (message, statusCode) => {
	if (
		statusCode >= StatusCodes.INTERNAL_SERVER_ERROR &&
		process.env.NODE_ENV === "production"
	) {
		return "Internal server error";
	}

	if (typeof message === "string" && message.trim().length > 0) {
		return message;
	}

	return "Internal server error";
};

const normalizeValidationDetails = (error) =>
	error.issues.map((issue) => ({
		path: issue.path.join("."),
		message: issue.message,
		code: issue.code,
	}));

const normalizeKnownErrors = (error) => {
	if (error instanceof ApiError) {
		return error;
	}

	if (error?.name === "CastError") {
		return ApiError.badRequest({
			code: "INVALID_ID",
			message: "Invalid ID format",
			details: {
				path: error.path,
				value: error.value,
			},
		});
	}

	if (error?.name === "ValidationError") {
		return ApiError.badRequest({
			code: "VALIDATION_ERROR",
			message: "Validation failed",
			details:
				error.errors && typeof error.errors === "object"
					? Object.values(error.errors).map((item) => ({
							path: item.path,
							message: item.message,
							kind: item.kind,
						}))
					: undefined,
		});
	}

	if (error?.code === 11_000) {
		const key = Object.keys(error?.keyPattern ?? {})[0];
		return new ApiError({
			statusCode: StatusCodes.CONFLICT,
			code: "DUPLICATE_RESOURCE",
			message: key
				? `Duplicate value for field '${key}'`
				: "Duplicate resource",
			details: error?.keyValue,
		});
	}

	return error;
};

export const errorHandler = (error, _req, res, _next) => {
	let normalizedError = normalizeKnownErrors(error);
	if (error instanceof ZodError) {
		normalizedError = ApiError.badRequest({
			code: "VALIDATION_ERROR",
			message: "Validation failed",
			details: normalizeValidationDetails(error),
		});
	}

	if (normalizedError instanceof ApiError) {
		const statusCode = normalizeStatusCode(normalizedError.statusCode);
		const code = normalizeErrorCode(normalizedError.code);
		const message = normalizeMessage(normalizedError.message, statusCode);
		const details =
			isObject(normalizedError.details) ||
			Array.isArray(normalizedError.details)
				? normalizedError.details
				: undefined;

		return sendError(res, {
			statusCode,
			code,
			message,
			details:
				statusCode < StatusCodes.INTERNAL_SERVER_ERROR ? details : undefined,
		});
	}

	const statusCode = normalizeStatusCode(normalizedError?.statusCode);
	const code = normalizeErrorCode(normalizedError?.code);
	const message = normalizeMessage(normalizedError?.message, statusCode);
	const details =
		isObject(normalizedError?.details) ||
		Array.isArray(normalizedError?.details)
			? normalizedError.details
			: undefined;

	return sendError(res, {
		statusCode,
		code,
		message,
		details:
			statusCode < StatusCodes.INTERNAL_SERVER_ERROR ? details : undefined,
	});
};
