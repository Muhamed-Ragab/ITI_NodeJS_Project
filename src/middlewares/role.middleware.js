import { StatusCodes } from "http-status-codes";

export const requireRole =
	(...allowedRoles) =>
	(req, _res, next) => {
		if (!req.user) {
			return next({
				statusCode: StatusCodes.UNAUTHORIZED,
				code: "UNAUTHORIZED",
				message: "Authentication required",
			});
		}

		if (!allowedRoles.includes(req.user.role)) {
			return next({
				statusCode: StatusCodes.FORBIDDEN,
				code: "FORBIDDEN",
				message: "You are not allowed to access this resource",
			});
		}

		return next();
	};
