import dotenv from "dotenv";
import { z } from "zod";

// Load .env early and merge into process.env
dotenv.config();

const envSchema = z.object({
	NODE_ENV: z
		.enum(["development", "production", "test"])
		.default("development"),
	PORT: z.coerce.number().default(3000),
	MONGODB_URI: z.url(),
	JWT_SECRET: z.string().min(32), // Minimum 32 chars for better security
	STRIPE_SECRET_KEY: z.string().optional(),
	CLOUDINARY_URL: z.string().optional(),
	GOOGLE_CLIENT_ID: z.string().optional(),
	GOOGLE_CLIENT_SECRET: z.string().optional(),
});

// Export schema for unit tests and external validation
export { envSchema };

// Parse and validate env — throws with readable error if something is missing/invalid
let envParsed;
try {
	envParsed = envSchema.parse(process.env);
} catch (err) {
	// In tests, provide stable defaults so modules depending on `env`
	// (e.g. auth token generation / oauth redirects) remain import-safe.
	// In non-test environments re-throw so the app fails fast.
	if (process.env.NODE_ENV === "test") {
		envParsed = envSchema.parse({
			NODE_ENV: "test",
			PORT: process.env.PORT ?? "3000",
			MONGODB_URI:
				process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017/testdb",
			JWT_SECRET: process.env.JWT_SECRET ?? "a".repeat(32),
			STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
			CLOUDINARY_URL: process.env.CLOUDINARY_URL,
			GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
			GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
		});
	} else {
		const zerr = err;
		throw new Error(`Environment validation failed: ${zerr.message}`);
	}
}

export const env = envParsed;
