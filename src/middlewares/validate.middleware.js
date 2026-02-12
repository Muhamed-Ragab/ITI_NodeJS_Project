import { ZodError } from "zod";

const VALIDATION_SOURCES = ["body", "params", "query"];

export const validate = (schemaMap) => async (req, _res, next) => {
	try {
		for (const source of VALIDATION_SOURCES) {
			const schema = schemaMap?.[source];
			if (!schema) {
				continue;
			}

			req[source] = await schema.parseAsync(req[source]);
		}

		next();
	} catch (error) {
		if (error instanceof ZodError) {
			error.statusCode = 400;
			error.code = "VALIDATION_ERROR";
		}
		next(error);
	}
};
