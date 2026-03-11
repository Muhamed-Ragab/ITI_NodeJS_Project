/* eslint-disable */
// @ts-nocheck

import app from "../dist/app.js";
// Import from built dist files
import { initializeApp } from "../dist/init.js";

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

	// Pass to Express app (app is already an Express instance)
	return app(req, res);
};

export default handler;
