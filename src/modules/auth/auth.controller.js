import { StatusCodes } from "http-status-codes";
import { env } from "../../config/env.js";
import { ApiError } from "../../utils/errors/api-error.js";
import { sendSuccess } from "../../utils/response.js";
import * as authService from "./auth.service.js";

export const register = async (req, res, next) => {
	try {
		const result = await authService.registerUser(req.body);
		return sendSuccess(res, {
			statusCode: StatusCodes.CREATED,
			data: result,
			message: "Registered successfully",
		});
	} catch (error) {
		next(
			error instanceof ApiError
				? error
				: ApiError.internal({
						code: "AUTH.REGISTER_FAILED",
						message: "Failed to register user",
						details: { message: error.message },
					})
		);
	}
};

export const login = async (req, res, next) => {
	try {
		const result = await authService.loginUser(req.body);
		return sendSuccess(res, {
			statusCode: StatusCodes.OK,
			data: result,
			message: "Logged in successfully",
		});
	} catch (error) {
		next(
			error instanceof ApiError
				? error
				: ApiError.internal({
						code: "AUTH.LOGIN_FAILED",
						message: "Failed to login",
						details: { message: error.message },
					})
		);
	}
};

export const googleStart = (_req, res) => {
	const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";
	const options = {
		redirect_uri: `http://localhost:${env.PORT}/api/auth/google/callback`,
		client_id: env.GOOGLE_CLIENT_ID,
		access_type: "offline",
		response_type: "code",
		prompt: "consent",
		scope: [
			"https://www.googleapis.com/auth/userinfo.profile",
			"https://www.googleapis.com/auth/userinfo.email",
		].join(" "),
	};

	const qs = new URLSearchParams(options);
	return res.redirect(`${rootUrl}?${qs.toString()}`);
};

export const googleCallback = async (_req, res, next) => {
	try {
		// TODO: Exchange _req.query.code for Google access token and fetch profile
		const profile = {
			id: "google_id_placeholder",
			displayName: "Google User",
			emails: [{ value: "google_user@gmail.com" }],
		};

		const result = await authService.handleGoogleCallback(profile);
		return sendSuccess(res, {
			statusCode: StatusCodes.OK,
			data: result,
			message: "Google login successful",
		});
	} catch (error) {
		next(
			error instanceof ApiError
				? error
				: ApiError.internal({
						code: "AUTH.GOOGLE_CALLBACK_FAILED",
						message: "Failed to complete Google login",
						details: { message: error.message },
					})
		);
	}
};
