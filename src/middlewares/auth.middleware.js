import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

const extractToken = (authorizationHeader = "") => {
	const [scheme, token] = authorizationHeader.split(" ");
	if (scheme !== "Bearer" || !token) {
		return null;
	}

	return token;
};

export const requireAuth = (req, _res, next) => {
	try {
		const token = extractToken(req.headers.authorization);

		if (!token) {
			return next({
				statusCode: StatusCodes.UNAUTHORIZED,
				code: "UNAUTHORIZED",
				message: "Missing or invalid authorization token",
			});
		}

		const payload = jwt.verify(token, env.JWT_SECRET);
		req.user = payload;
		return next();
	} catch {
		return next({
			statusCode: StatusCodes.UNAUTHORIZED,
			code: "UNAUTHORIZED",
			message: "Unauthorized",
		});
	}
};
