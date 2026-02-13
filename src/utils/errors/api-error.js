import { StatusCodes } from "http-status-codes";

export class ApiError extends Error {
	constructor({
		statusCode = StatusCodes.INTERNAL_SERVER_ERROR,
		code = "INTERNAL_SERVER_ERROR",
		message = "Internal server error",
		details,
	} = {}) {
		super(message);
		this.name = "ApiError";
		this.statusCode = statusCode;
		this.code = code;
		this.details = details;
		this.isOperational = true;
	}

	static badRequest({ code = "BAD_REQUEST", message, details } = {}) {
		return new ApiError({
			statusCode: StatusCodes.BAD_REQUEST,
			code,
			message: message ?? "Bad request",
			details,
		});
	}

	static unauthorized({ code = "UNAUTHORIZED", message, details } = {}) {
		return new ApiError({
			statusCode: StatusCodes.UNAUTHORIZED,
			code,
			message: message ?? "Unauthorized",
			details,
		});
	}

	static forbidden({ code = "FORBIDDEN", message, details } = {}) {
		return new ApiError({
			statusCode: StatusCodes.FORBIDDEN,
			code,
			message: message ?? "Forbidden",
			details,
		});
	}

	static notFound({ code = "NOT_FOUND", message, details } = {}) {
		return new ApiError({
			statusCode: StatusCodes.NOT_FOUND,
			code,
			message: message ?? "Resource not found",
			details,
		});
	}

	static internal({ code = "INTERNAL_SERVER_ERROR", message, details } = {}) {
		return new ApiError({
			statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
			code,
			message: message ?? "Internal server error",
			details,
		});
	}
}
