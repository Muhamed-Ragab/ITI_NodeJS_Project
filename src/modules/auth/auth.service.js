import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../../config/env.js";
import {
	generateEmailOtpToken,
	generateEmailVerificationToken,
	hashEmailOtp,
	hashVerificationToken,
	sendEmailOtp,
	sendVerificationEmail,
} from "../../services/notifications/email-provider.js";
import { ApiError } from "../../utils/errors/api-error.js";
import { logDevError } from "../../utils/logger.js";
import * as authRepository from "./auth.repository.js";

const generateToken = (user) =>
	jwt.sign(
		{
			id: user._id,
			email: user.email,
			role: user.role,
			tokenVersion: user.tokenVersion ?? 0,
		},
		env.JWT_SECRET,
		{ expiresIn: "7d" }
	);

const stripPassword = (user) => {
	const { password, ...rest } = user.toObject();
	return rest;
};

const mapGoogleUserError = (error) => {
	if (error instanceof ApiError) {
		return error;
	}

	if (error?.code === 11_000) {
		return ApiError.badRequest({
			code: "AUTH.GOOGLE_ACCOUNT_CONFLICT",
			message: "Google account is already linked to another user",
		});
	}

	if (error?.name === "ValidationError") {
		logDevError({
			scope: "auth.google.user-validation",
			message: "Google user validation error",
			error,
		});

		return ApiError.badRequest({
			code: "AUTH.GOOGLE_USER_VALIDATION_FAILED",
			message: "Google user data is invalid",
		});
	}

	if (error?.name === "CastError") {
		logDevError({
			scope: "auth.google.user-cast",
			message: "Google user cast error",
			error,
		});

		return ApiError.badRequest({
			code: "AUTH.GOOGLE_USER_INVALID_DATA",
			message: "Google user contains invalid data",
		});
	}

	logDevError({
		scope: "auth.google.user-processing",
		message: "Unhandled Google user processing error",
		error,
	});

	return ApiError.internal({
		code: "AUTH.GOOGLE_USER_PROCESSING_FAILED",
		message: "Failed to process Google user",
	});
};

export const registerUser = async ({ name, email, password }) => {
	const existing = await authRepository.findUserByEmail(email);
	if (existing) {
		throw ApiError.badRequest({
			code: "AUTH.EMAIL_EXISTS",
			message: "Email already exists",
		});
	}

	const verification = generateEmailVerificationToken();

	const user = await authRepository.createUser({
		name,
		email,
		password,
		isEmailVerified: false,
		emailVerificationTokenHash: verification.tokenHash,
		emailVerificationTokenExpiresAt: verification.expiresAt,
	});

	await sendVerificationEmail({
		email: user.email,
		name: user.name,
		token: verification.token,
	});

	return {
		user: stripPassword(user),
		requiresEmailVerification: true,
	};
};

export const loginUser = async ({ email, password }) => {
	const user = await authRepository.findUserByEmail(email);
	if (!user) {
		throw ApiError.unauthorized({
			code: "AUTH.INVALID_CREDENTIALS",
			message: "Invalid credentials",
		});
	}

	if (user.deletedAt) {
		throw ApiError.unauthorized({
			code: "AUTH.USER_DELETED",
			message: "User account is no longer available",
		});
	}

	if (user.isRestricted) {
		throw ApiError.forbidden({
			code: "AUTH.USER_RESTRICTED",
			message: "Your account is restricted",
		});
	}

	const isMatch = await bcrypt.compare(password, user.password);
	if (!isMatch) {
		throw ApiError.unauthorized({
			code: "AUTH.INVALID_CREDENTIALS",
			message: "Invalid credentials",
		});
	}

	if (!user.isEmailVerified) {
		throw ApiError.unauthorized({
			code: "AUTH.EMAIL_NOT_VERIFIED",
			message: "Please verify your email before login",
		});
	}

	const token = generateToken(user);

	return { user: stripPassword(user), token };
};

export const requestEmailOtp = async ({ email }) => {
	const user = await authRepository.findUserByEmail(email);
	if (!user) {
		throw ApiError.unauthorized({
			code: "AUTH.INVALID_EMAIL_OTP",
			message: "Invalid email or OTP",
		});
	}

	if (user.deletedAt) {
		throw ApiError.unauthorized({
			code: "AUTH.USER_DELETED",
			message: "User account is no longer available",
		});
	}

	if (user.isRestricted) {
		throw ApiError.forbidden({
			code: "AUTH.USER_RESTRICTED",
			message: "Your account is restricted",
		});
	}

	const otpData = generateEmailOtpToken();
	await authRepository.setEmailOtp(
		user._id,
		otpData.otpHash,
		otpData.expiresAt
	);
	await sendEmailOtp({ email: user.email, name: user.name, otp: otpData.otp });

	return {
		otpRequested: true,
		expiresAt: otpData.expiresAt,
	};
};

export const loginWithEmailOtp = async ({ email, otp }) => {
	const user = await authRepository.findUserByEmailWithOtp(email);
	if (!user) {
		throw ApiError.unauthorized({
			code: "AUTH.INVALID_EMAIL_OTP",
			message: "Invalid email or OTP",
		});
	}

	if (user.deletedAt) {
		throw ApiError.unauthorized({
			code: "AUTH.USER_DELETED",
			message: "User account is no longer available",
		});
	}

	if (user.isRestricted) {
		throw ApiError.forbidden({
			code: "AUTH.USER_RESTRICTED",
			message: "Your account is restricted",
		});
	}

	if (!(user.emailOtpHash && user.emailOtpExpiresAt)) {
		throw ApiError.unauthorized({
			code: "AUTH.EMAIL_OTP_REQUIRED",
			message: "OTP is missing. Request a new OTP",
		});
	}

	if (new Date(user.emailOtpExpiresAt) < new Date()) {
		throw ApiError.unauthorized({
			code: "AUTH.EMAIL_OTP_EXPIRED",
			message: "OTP has expired. Request a new OTP",
		});
	}

	const otpHash = hashEmailOtp(otp);
	if (otpHash !== user.emailOtpHash) {
		throw ApiError.unauthorized({
			code: "AUTH.INVALID_EMAIL_OTP",
			message: "Invalid email or OTP",
		});
	}

	const verifiedUser = await authRepository.consumeEmailOtp(user._id);
	const token = generateToken(verifiedUser);

	return {
		user: stripPassword(verifiedUser),
		token,
	};
};

export const verifyEmailByToken = async (token) => {
	const tokenHash = hashVerificationToken(token);

	const user =
		await authRepository.findUserByEmailVerificationTokenHash(tokenHash);
	if (!user) {
		throw ApiError.badRequest({
			code: "AUTH.INVALID_VERIFICATION_TOKEN",
			message: "Email verification token is invalid",
		});
	}

	if (
		!user.emailVerificationTokenExpiresAt ||
		new Date(user.emailVerificationTokenExpiresAt) < new Date()
	) {
		throw ApiError.badRequest({
			code: "AUTH.VERIFICATION_TOKEN_EXPIRED",
			message: "Email verification token has expired",
		});
	}

	const verifiedUser = await authRepository.verifyUserEmail(user._id);

	return {
		verified: true,
		user: stripPassword(verifiedUser),
	};
};

export const logoutUser = async (user) => {
	const existingUser = await authRepository.findUserById(user?.id);
	if (!existingUser) {
		throw ApiError.notFound({
			code: "AUTH.USER_NOT_FOUND",
			message: "User not found",
		});
	}

	await authRepository.incrementTokenVersion(existingUser._id);

	return { loggedOut: true };
};

export const handleGoogleCallback = async (profile) => {
	try {
		let user = await authRepository.findUserByGoogleId(profile.id);
		const email = profile.emails?.[0]?.value?.trim().toLowerCase();
		const name = profile.displayName?.trim() || "Google User";

		if (!email) {
			throw ApiError.badRequest({
				code: "AUTH.GOOGLE_EMAIL_MISSING",
				message: "Google account email is required",
			});
		}

		if (!user) {
			try {
				const existingUserByEmail = await authRepository.findUserByEmail(email);
				if (existingUserByEmail) {
					user = await authRepository.attachGoogleIdToUser(
						existingUserByEmail._id,
						profile.id
					);
				} else {
					user = await authRepository.createUser({
						name,
						email,
						googleId: profile.id,
						isEmailVerified: true,
					});
				}
			} catch (error) {
				throw mapGoogleUserError(error);
			}
		}

		if (!user) {
			throw ApiError.internal({
				code: "AUTH.GOOGLE_USER_UPSERT_FAILED",
				message: "Failed to upsert Google user",
			});
		}

		const token = generateToken(user);

		return { user: stripPassword(user), token };
	} catch (error) {
		throw mapGoogleUserError(error);
	}
};
