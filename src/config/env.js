import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
	NODE_ENV: z
		.enum(["development", "production", "test"])
		.default("development"),
	PORT: z.coerce.number().default(3000),
	MONGODB_URI: z.url(),
	JWT_SECRET: z.string().min(32),
	STRIPE_SECRET_KEY: z.string().optional(),
	CLOUDINARY_URL: z.string().optional(),
	GOOGLE_CLIENT_ID: z.string().optional(),
	GOOGLE_CLIENT_SECRET: z.string().optional(),
	APP_BASE_URL: z.string().url(),
	BACKEND_API_URL: z.string().url().optional(),
	SMTP_HOST: z.string().optional(),
	SMTP_PORT: z.coerce.number().optional(),
	SMTP_USER: z.string().optional(),
	SMTP_PASS: z.string().optional(),
	MAIL_FROM: z.string().optional(),
	SMTP_FROM: z.string().optional(),
});

export { envSchema };

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
			APP_BASE_URL: process.env.APP_BASE_URL ?? "http://localhost:3000",
			BACKEND_API_URL: process.env.BACKEND_API_URL ?? "http://localhost:3000",
			SMTP_HOST: process.env.SMTP_HOST,
			SMTP_PORT: process.env.SMTP_PORT,
			SMTP_USER: process.env.SMTP_USER,
			SMTP_PASS: process.env.SMTP_PASS,
			MAIL_FROM: process.env.MAIL_FROM,
			SMTP_FROM: process.env.SMTP_FROM,
			STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
		});
	} else {
		const zerr = err;
		throw new Error(`Environment validation failed: ${zerr.message}`);
	}
}

export const env = envParsed;
