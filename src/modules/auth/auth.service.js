import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../../config/env.js";
import { ApiError } from "../../utils/errors/api-error.js";
import { logDevError } from "../../utils/logger.js";
import * as authRepository from "./auth.repository.js";

const generateToken = (user) =>
	jwt.sign(
		{ id: user._id, email: user.email, role: user.role },
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

	const user = await authRepository.createUser({ name, email, password });
	const token = generateToken(user);

	return { user: stripPassword(user), token };
};

export const loginUser = async ({ email, password }) => {
	const user = await authRepository.findUserByEmail(email);
	if (!user) {
		throw ApiError.unauthorized({
			code: "AUTH.INVALID_CREDENTIALS",
			message: "Invalid credentials",
		});
	}

	const isMatch = await bcrypt.compare(password, user.password);
	if (!isMatch) {
		throw ApiError.unauthorized({
			code: "AUTH.INVALID_CREDENTIALS",
			message: "Invalid credentials",
		});
	}

	const token = generateToken(user);

	return { user: stripPassword(user), token };
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
