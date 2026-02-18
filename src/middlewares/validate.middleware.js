import { ZodError } from "zod";
import { ApiError } from "../utils/errors/api-error.js";

const VALIDATION_SOURCES = ["body", "params", "query"];

const setValidatedValue = (req, source, value) => {
	Object.defineProperty(req, source, {
		value,
		writable: true,
		enumerable: true,
		configurable: true,
	});
};

export const validate = (schemaMap) => async (req, _res, next) => {
	try {
		for (const source of VALIDATION_SOURCES) {
			const schema = schemaMap?.[source];
			if (!schema) {
				continue;
			}

			const parsedValue = await schema.parseAsync(req[source]);
			setValidatedValue(req, source, parsedValue);
		}

		next();
	} catch (error) {
		if (error instanceof ZodError) {
			return next(
				ApiError.badRequest({
					code: "VALIDATION_ERROR",
					message: "Validation failed",
					details: error.issues.map((issue) => ({
						path: issue.path.join("."),
						message: issue.message,
						code: issue.code,
					})),
				})
			);
		}
		next(error);
	}
};
