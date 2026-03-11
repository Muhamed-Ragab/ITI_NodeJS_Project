import app from "./app.js";
import connectDB from "./config/db.js";
import { env } from "./config/env.js";
import { registerEmailEventListeners } from "./services/notifications/email-events.js";
import * as emailService from "./services/notifications/email-provider.js";

const PORT = env.PORT || 3000;

const startServer = async () => {
	try {
		await connectDB();
		console.log("MongoDB connected successfully!");

		// Register email event listeners
		registerEmailEventListeners(emailService);

		app.listen(PORT, () => {
			console.log(`Server running on port ${PORT} in ${env.NODE_ENV} mode`);
			console.log(`Access API at http://localhost:${PORT}`);
		});
	} catch (err) {
		console.error("Failed to start server:", err);
		process.exit(1);
	}
};

startServer();
