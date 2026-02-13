import { ApiError } from "../utils/errors/api-error.js";

export const requireRole =
	(...allowedRoles) =>
	(req, _res, next) => {
		if (!req.user) {
			return next(
				ApiError.unauthorized({
					message: "Authentication required",
				})
			);
		}

		if (!allowedRoles.includes(req.user.role)) {
			return next(
				ApiError.forbidden({
					message: "You are not allowed to access this resource",
				})
			);
		}

		return next();
	};
