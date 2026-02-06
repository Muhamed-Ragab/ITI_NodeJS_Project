import app from "./app.js";
import connectDB from "./config/db.js";
import { env } from "./config/env.js";

const PORT = env.PORT || 3000;

const startServer = async () => {
	// Connect to Database
	await connectDB();

	app.listen(PORT, () => {
		console.log(`Server running on port ${PORT} in ${env.NODE_ENV} mode`);
		console.log(`Access API at http://localhost:${PORT}`);
	});
};

startServer();
