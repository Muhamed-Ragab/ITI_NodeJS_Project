import cors from "cors";
import express from "express";
import morgan from "morgan";
import { env } from "./config/env.js"; // Import validated env
import { errorHandler } from "./middlewares/error.middleware.js";

const app = express();

// Middleware
app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev")); // HTTP request logger
app.use(
	cors({
		origin:
			env.NODE_ENV === "production" ? "https://your-frontend-domain.com" : "*",
	})
); // Enable CORS, adjust origin for production
app.use(express.json()); // Body parser for JSON
app.use(express.urlencoded({ extended: true })); // Body parser for URL-encoded data

// Basic route
app.get("/", (_req, res) => {
	res.status(200).json({
		message: "API is running!",
		version: "1.0.0",
		nodeEnv: env.NODE_ENV,
	});
});

app.use(errorHandler);

export default app;
