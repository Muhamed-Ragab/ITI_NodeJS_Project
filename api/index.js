import app from "../src/app.js";
import connectDB from "../src/config/db.js";
import { env } from "../src/config/env.js";
import { registerEmailEventListeners } from "../src/services/notifications/email-events.js";
import * as emailService from "../src/services/notifications/email-provider.js";

// Initialize database and email listeners once
let dbConnected = false;
let emailListenersRegistered = false;

const initializeApp = async () => {
	if (!dbConnected) {
		try {
			await connectDB();
			console.log("MongoDB connected successfully!");
			dbConnected = true;
		} catch (err) {
			console.error("Failed to connect to MongoDB:", err);
			throw err;
		}
	}

	if (!emailListenersRegistered) {
		try {
			registerEmailEventListeners(emailService);
			emailListenersRegistered = true;
		} catch (err) {
			console.error("Failed to register email listeners:", err);
			throw err;
		}
	}
};

// Vercel serverless handler
export default async (req, res) => {
	try {
		// Log incoming request
		console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);

		// Initialize app on first request
		await initializeApp();

		// Wrap the app call to catch any errors
		return new Promise((resolve, reject) => {
			// Set a timeout to prevent hanging (55 seconds to leave buffer for Vercel's 60s limit)
			const timeout = setTimeout(() => {
				reject(new Error("Request timeout"));
			}, 55_000);

			// Handle the request with Express app
			app(req, res);

			// Clear timeout on response
			res.on("finish", () => {
				clearTimeout(timeout);
				console.log(
					`[${new Date().toISOString()}] Response sent with status ${res.statusCode}`
				);
				resolve();
			});

			res.on("error", (err) => {
				clearTimeout(timeout);
				console.error(`[${new Date().toISOString()}] Response error:`, err);
				reject(err);
			});
		});
	} catch (err) {
		console.error(
			`[${new Date().toISOString()}] Error in serverless handler:`,
			err
		);
		console.error("Stack trace:", err.stack);

		// Only send response if headers haven't been sent
		if (!res.headersSent) {
			const errorResponse = {
				success: false,
				message: "Internal server error",
			};

			// Add error details in development
			if (env.NODE_ENV === "development") {
				errorResponse.error = {
					code: err.code || "INTERNAL_SERVER_ERROR",
					message: err.message,
					stack: err.stack,
				};
			} else {
				errorResponse.error = {
					code: "INTERNAL_SERVER_ERROR",
				};
			}

			res.status(500).json(errorResponse);
		}
	}
};
