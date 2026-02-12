export const sendSuccess = (
	res,
	{ statusCode = 200, data = null, message } = {}
) =>
	res.status(statusCode).json({
		success: true,
		data,
		...(message ? { message } : {}),
	});

export const sendError = (
	res,
	{ statusCode = 500, code = "INTERNAL_SERVER_ERROR", details, message } = {}
) =>
	res.status(statusCode).json({
		success: false,
		error: {
			code,
			...(details !== undefined ? { details } : {}),
		},
		...(message ? { message } : {}),
	});
