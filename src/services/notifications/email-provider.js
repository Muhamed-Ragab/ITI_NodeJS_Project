import crypto from "node:crypto";
import { API_PREFIX } from "../../config/api-config.js";
import { env } from "../../config/env.js";
import { sendMail } from "./mailer.js";

const TRAILING_SLASH_REGEX = /\/$/;

const buildAppBaseUrl = () => {
	if (env.APP_BASE_URL) {
		return env.APP_BASE_URL.replace(TRAILING_SLASH_REGEX, "");
	}

	return `http://localhost:${env.PORT}`;
};

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
	const verificationLink = `${buildAppBaseUrl()}${API_PREFIX}/auth/verify-email?token=${encodeURIComponent(token)}`;
	const subject = "Verify your email";
	const text = `Hi ${name || "there"},\n\nPlease verify your email using this link:\n${verificationLink}\n\nThis link expires in 24 hours.`;
	const html = `<p>Hi ${name || "there"},</p><p>Please verify your email using this link:</p><p><a href="${verificationLink}">${verificationLink}</a></p><p>This link expires in 24 hours.</p>`;

	return await sendMail({ to: email, subject, text, html });
};

export const sendEmailOtp = async ({ email, name, otp }) => {
	const subject = "Your login OTP code";
	const text = `Hi ${name || "there"},\n\nYour OTP is: ${otp}\nIt expires in 5 minutes.`;
	const html = `<p>Hi ${name || "there"},</p><p>Your OTP is: <strong>${otp}</strong></p><p>It expires in 5 minutes.</p>`;

	return await sendMail({ to: email, subject, text, html });
};
