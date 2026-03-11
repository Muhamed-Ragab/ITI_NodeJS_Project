import crypto from "node:crypto";
import { API_PREFIX } from "../../config/api-config.js";
import { env } from "../../config/env.js";
import { logDevError } from "../../utils/logger.js";
import { createEmailProvider } from "./providers/provider-factory.js";
import {
	otpEmailTemplate,
	passwordResetEmailTemplate,
	verificationEmailTemplate,
	welcomeEmailTemplate,
} from "./templates/email-templates.js";

const TRAILING_SLASH_REGEX = /\/$/;

// Singleton email provider instance
let emailProvider = null;

/**
 * Get or create the email provider instance
 * @returns {EmailProviderStrategy}
 */
const getEmailProvider = () => {
	if (!emailProvider) {
		emailProvider = createEmailProvider();
	}
	return emailProvider;
};

const buildBackendApiUrl = () =>
	env.BACKEND_API_URL
		? env.BACKEND_API_URL.replace(TRAILING_SLASH_REGEX, "")
		: `http://localhost:${env.PORT}`;

export const generateEmailVerificationToken = () => {
	const token = crypto.randomBytes(32).toString("hex");
	const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

	return {
		token,
		tokenHash,
		expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24), // 24h
	};
};

export const hashVerificationToken = (token) => {
	return crypto.createHash("sha256").update(token).digest("hex");
};

export const generateEmailOtpToken = () => {
	const otp = crypto.randomInt(0, 1_000_000).toString().padStart(6, "0");
	const otpHash = crypto.createHash("sha256").update(otp).digest("hex");

	return {
		otp,
		otpHash,
		expiresAt: new Date(Date.now() + 1000 * 60 * 5), // 5m
	};
};

export const hashEmailOtp = (otp) => {
	return crypto.createHash("sha256").update(String(otp)).digest("hex");
};

export const sendVerificationEmail = async ({ email, name, token }) => {
	// Test mode simulation
	if (env.NODE_ENV === "test") {
		logDevError({
			scope: "notifications.email",
			message: "Verification email simulated (test mode)",
			meta: { email, name, token },
		});
		return { sent: true, simulated: true, messageId: "test-verification" };
	}

	const provider = getEmailProvider();

	// Check if provider is configured
	if (!provider.isConfigured()) {
		logDevError({
			scope: "notifications.email",
			message: "Email provider not configured, simulating send",
			meta: { email, name },
		});
		return { sent: true, simulated: true, messageId: "simulated-verification" };
	}

	try {
		const verificationLink = `${buildBackendApiUrl()}${API_PREFIX}/auth/verify-email?token=${encodeURIComponent(token)}`;
		const { html, text } = verificationEmailTemplate({
			name,
			verificationLink,
		});
		const subject = "Verify your email - ITI E-Commerce";

		return await provider.sendEmail(email, subject, text, html);
	} catch (error) {
		console.error("Failed to send verification email:", error);
		throw new Error(`Email send failed: ${error.message}`);
	}
};

export const sendEmailOtp = async ({ email, name, otp }) => {
	// Test mode simulation
	if (env.NODE_ENV === "test") {
		logDevError({
			scope: "notifications.email",
			message: "OTP email simulated (test mode)",
			meta: { email, name, otp },
		});
		return { sent: true, simulated: true, messageId: "test-otp" };
	}

	const provider = getEmailProvider();

	// Check if provider is configured
	if (!provider.isConfigured()) {
		logDevError({
			scope: "notifications.email",
			message: "Email provider not configured, simulating send",
			meta: { email, name },
		});
		return { sent: true, simulated: true, messageId: "simulated-otp" };
	}

	try {
		const { html, text } = otpEmailTemplate({ name, otp });
		const subject = "Your login code - ITI E-Commerce";

		return await provider.sendEmail(email, subject, text, html);
	} catch (error) {
		console.error("Failed to send OTP email:", error);
		throw new Error(`Email send failed: ${error.message}`);
	}
};

export const sendPasswordResetEmail = async ({ email, name, resetLink }) => {
	// Test mode simulation
	if (env.NODE_ENV === "test") {
		logDevError({
			scope: "notifications.email",
			message: "Password reset email simulated (test mode)",
			meta: { email, name },
		});
		return { sent: true, simulated: true, messageId: "test-password-reset" };
	}

	const provider = getEmailProvider();

	// Check if provider is configured
	if (!provider.isConfigured()) {
		logDevError({
			scope: "notifications.email",
			message: "Email provider not configured, simulating send",
			meta: { email, name },
		});
		return {
			sent: true,
			simulated: true,
			messageId: "simulated-password-reset",
		};
	}

	try {
		const { html, text } = passwordResetEmailTemplate({ name, resetLink });
		const subject = "Reset your password - ITI E-Commerce";

		return await provider.sendEmail(email, subject, text, html);
	} catch (error) {
		console.error("Failed to send password reset email:", error);
		throw new Error(`Email send failed: ${error.message}`);
	}
};

export const sendWelcomeEmail = async ({ email, name }) => {
	// Test mode simulation
	if (env.NODE_ENV === "test") {
		logDevError({
			scope: "notifications.email",
			message: "Welcome email simulated (test mode)",
			meta: { email, name },
		});
		return { sent: true, simulated: true, messageId: "test-welcome" };
	}

	const provider = getEmailProvider();

	// Check if provider is configured
	if (!provider.isConfigured()) {
		logDevError({
			scope: "notifications.email",
			message: "Email provider not configured, simulating send",
			meta: { email, name },
		});
		return { sent: true, simulated: true, messageId: "simulated-welcome" };
	}

	try {
		const { html, text } = welcomeEmailTemplate({ name });
		const subject = "Welcome to ITI E-Commerce!";

		return await provider.sendEmail(email, subject, text, html);
	} catch (error) {
		console.error("Failed to send welcome email:", error);
		throw new Error(`Email send failed: ${error.message}`);
	}
};
