import { StatusCodes } from "http-status-codes";

export const sendSuccess = (
	res,
	{ statusCode = StatusCodes.OK, data = null, message } = {}
) =>
	res.status(statusCode).json({
		success: true,
		data,
		...(message ? { message } : {}),
	});

export const sendError = (
	res,
	{
		statusCode = StatusCodes.INTERNAL_SERVER_ERROR,
		code = "INTERNAL_SERVER_ERROR",
		details,
		message,
	} = {}
) =>
	res.status(statusCode).json({
		success: false,
		error: {
			code,
			...(details !== undefined ? { details } : {}),
		},
		...(message ? { message } : {}),
	});
