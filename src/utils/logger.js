import { env } from "../config/env.js";

export const logDevError = ({ scope, message, error, meta } = {}) => {
	if (env.NODE_ENV === "production") {
		return;
	}

	console.error(`[${scope || "app"}] ${message || "Unexpected error"}`, {
		name: error?.name,
		message: error?.message,
		stack: error?.stack,
		meta,
	});
};
