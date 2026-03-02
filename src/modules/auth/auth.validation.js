import { z } from "zod";

export const registerSchema = z.object({
	name: z.string().trim().min(2).max(50),
	email: z.string().trim().toLowerCase().pipe(z.email()),
	password: z.string().min(6).max(128),
});

export const loginSchema = z.object({
	email: z.string().trim().toLowerCase().pipe(z.email()),
	password: z.string().min(6),
});

export const emailRequestOtpSchema = z.object({
	email: z.string().trim().toLowerCase().pipe(z.email()),
});

export const emailLoginSchema = z.object({
	email: z.string().trim().toLowerCase().pipe(z.email()),
	otp: z
		.string()
		.trim()
		.regex(/^\d{6}$/, "OTP must be a 6-digit code"),
});

export const googleCallbackSchema = z.object({
	code: z.string().min(1),
});

export const verifyEmailSchema = z.object({
	token: z.string().min(1),
});
