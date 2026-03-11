import mongoose from "mongoose";
import { env } from "./env.js";

const connectDB = async () => {
	try {
		// Check if already connected
		if (mongoose.connection.readyState === 1) {
			console.log("MongoDB already connected");
			return;
		}

		const conn = await mongoose.connect(env.MONGODB_URI, {
			maxPoolSize: 10,
			minPoolSize: 2,
			serverSelectionTimeoutMS: 5000,
			socketTimeoutMS: 45_000,
			connectTimeoutMS: 10_000,
			retryWrites: true,
			w: "majority",
		});

		console.log(`MongoDB Connected: ${conn.connection.host}`);
	} catch (error) {
		console.error(`Error: ${error.message}`);
		throw error;
	}
};

export default connectDB;
