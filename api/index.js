/* eslint-disable */
// @ts-nocheck

import app from "../dist/app.js";
// Import from built dist files
import { initializeApp } from "../dist/init.js";
import { emailEvents } from "../dist/services/notifications/email-events.js";

// Initialize on first request
let initialized = false;

const handler = async (req, res) => {
	if (!initialized) {
		try {
			await initializeApp();
			initialized = true;
		} catch (err) {
			console.error("Initialization failed:", err);
			return res.status(500).json({
				success: false,
				message: "Failed to initialize",
				error: err.message,
			});
		}
	}

	// Wrap the response to wait for pending emails before sending
	const originalJson = res.json.bind(res);
	res.json = (data) => {
		// Wait for pending emails before sending response
		emailEvents.waitForPendingEmails(3000).finally(() => {
			originalJson(data);
		});
		return res;
	};

	// Pass to Express app (app is already an Express instance)
	return app(req, res);
};

export default handler;
