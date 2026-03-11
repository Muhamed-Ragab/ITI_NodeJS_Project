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
		// Initialize app on first request
		await initializeApp();

		// Handle the request with Express app
		app(req, res);
	} catch (err) {
		console.error("Error in serverless handler:", err);
		res.status(500).json({
			success: false,
			message: "Internal server error",
			error: env.NODE_ENV === "development" ? err.message : undefined,
		});
	}
};
