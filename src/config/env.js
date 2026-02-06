import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),
  MONGODB_URI: z.string().url(),
  JWT_SECRET: z.string().min(32), // Minimum 32 chars for better security
  STRIPE_SECRET_KEY: z.string(),
  CLOUDINARY_URL: z.string(),
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
});

// Load environment variables from .env file
// Ensure dotenv is configured in server.js or app.js before this is imported
// Or configure it here directly if this is the main entry point for env loading
// For now, assuming dotenv.config() is called elsewhere before this is used.

export const env = envSchema.parse(process.env);
