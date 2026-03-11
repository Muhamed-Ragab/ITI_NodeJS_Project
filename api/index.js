import app from "../dist/app.js";
import connectDB from "../dist/config/db.js";
import { registerEmailEventListeners } from "../dist/services/notifications/email-events.js";
import * as emailService from "../dist/services/notifications/email-provider.js";

// Initialize database and email listeners
let initialized = false;

const initialize = async () => {
	if (initialized) {
		return;
	}

	try {
		await connectDB();
		registerEmailEventListeners(emailService);
		initialized = true;
	} catch (err) {
		console.error("Initialization error:", err);
		throw err;
	}
};

// For Vercel serverless
export default async (req, res) => {
	await initialize();
	app(req, res);
};
