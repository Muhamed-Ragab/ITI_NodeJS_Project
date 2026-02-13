import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { ApiError } from "../utils/errors/api-error.js";

const extractToken = (authorizationHeader = "") => {
	const [scheme, token] = authorizationHeader.split(" ");
	if (scheme !== "Bearer" || !token) {
		return null;
	}

	return token;
};

export const requireAuth = (req, _res, next) => {
	try {
		const jwtSecret = process.env.JWT_SECRET ?? env?.JWT_SECRET;
		if (!jwtSecret) {
			return next(
				ApiError.internal({
					code: "SERVER_MISCONFIG",
					message: "JWT secret is not configured",
				})
			);
		}

		const token = extractToken(req.headers.authorization);

		if (!token) {
			return next(
				ApiError.unauthorized({
					message: "Missing or invalid authorization token",
				})
			);
		}

		const payload = jwt.verify(token, jwtSecret);
		req.user = payload;
		return next();
	} catch {
		return next(ApiError.unauthorized());
	}
};
