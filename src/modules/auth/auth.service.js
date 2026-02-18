import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../../config/env.js";
import { ApiError } from "../../utils/errors/api-error.js";
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
	let user = await authRepository.findUserByGoogleId(profile.id);

	if (!user) {
		user = await authRepository.createUser({
			name: profile.displayName,
			email: profile.emails[0].value,
			googleId: profile.id,
		});
	}

	const token = generateToken(user);

	return { user: stripPassword(user), token };
};
