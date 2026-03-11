import connectDB from "./config/db.js";
import { registerEmailEventListeners } from "./services/notifications/email-events.js";
import * as emailService from "./services/notifications/email-provider.js";

let initialized = false;

export const initializeApp = async () => {
	if (initialized) {
		return;
	}

	try {
		await connectDB();
		console.log("MongoDB connected successfully!");

		// Register email event listeners
		registerEmailEventListeners(emailService);
		console.log("Email listeners registered!");

		initialized = true;
	} catch (err) {
		console.error("Failed to initialize app:", err);
		throw err;
	}
};
