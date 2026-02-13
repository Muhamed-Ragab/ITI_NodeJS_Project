import cors from "cors";
import express from "express";
import { StatusCodes } from "http-status-codes";
import morgan from "morgan";
import { z } from "zod";
import { env } from "./config/env.js"; // Import validated env
import { errorHandler } from "./middlewares/error.middleware.js";
import { validate } from "./middlewares/validate.middleware.js";
import { sendError, sendSuccess } from "./utils/response.js";

const app = express();
const appNodeEnv = env?.NODE_ENV ?? process.env.NODE_ENV ?? "development";

// Middleware
app.use(morgan(appNodeEnv === "production" ? "combined" : "dev")); // HTTP request logger
app.use(
	cors({
		origin:
			appNodeEnv === "production" ? "https://your-frontend-domain.com" : "*",
	})
); // Enable CORS, adjust origin for production
app.use(express.json()); // Body parser for JSON
app.use(express.urlencoded({ extended: true })); // Body parser for URL-encoded data

// Basic route
app.get("/", (_req, res) => {
	return sendSuccess(res, {
		data: {
			version: "1.0.0",
			nodeEnv: appNodeEnv,
		},
		message: "API is running!",
	});
});

const responseExampleSchema = z.object({
	name: z.string().trim().min(1),
	role: z.enum(["admin", "member"]).default("member"),
});

// Example route for team members to see middleware + response helpers usage.
app.post(
	"/examples/response",
	validate({ body: responseExampleSchema }),
	(req, res) => {
		if (req.body.name.toLowerCase() === "error") {
			return sendError(res, {
				statusCode: StatusCodes.BAD_REQUEST,
				code: "EXAMPLE_BUSINESS_ERROR",
				message: "Example business rule failed",
				details: {
					name: "Please use any name except 'error'.",
				},
			});
		}

		return sendSuccess(res, {
			statusCode: StatusCodes.CREATED,
			data: req.body,
			message: "Example response created successfully",
		});
	}
);

app.use(errorHandler);

export default app;
