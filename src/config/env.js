import dotenv from "dotenv";
import { z } from "zod";

// Load .env early and merge into process.env
dotenv.config();

const envSchema = z.object({
	NODE_ENV: z
		.enum(["development", "production", "test"])
		.default("development"),
	PORT: z.coerce.number().default(3000),
	MONGODB_URI: z.string().url(),
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
	// Re-throw with a clearer message for CI/developers
	const zerr = err;
	throw new Error(`Environment validation failed: ${zerr.message}`);
}

export const env = envParsed;
