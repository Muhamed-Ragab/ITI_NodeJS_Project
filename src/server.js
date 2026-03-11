import app from "./app.js";
import { initializeApp } from "./init.js";
import { env } from "./config/env.js";

const PORT = env.PORT || 3000;

const startServer = async () => {
	try {
		await initializeApp();

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
