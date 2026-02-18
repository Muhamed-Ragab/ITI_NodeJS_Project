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
		const { code } = _req.query;
		const redirectUri = `http://localhost:${env.PORT}/api/auth/google/callback`;

		let profile;
		if (env.NODE_ENV === "test") {
			profile = {
				id: "google_id_placeholder",
				displayName: "Google User",
				emails: [{ value: "google_user@gmail.com" }],
			};
		} else {
			if (!(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET)) {
				return next(
					ApiError.internal({
						code: "AUTH.GOOGLE_CONFIG_MISSING",
						message: "Google OAuth credentials are not configured",
					})
				);
			}

			const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
				method: "POST",
				headers: { "Content-Type": "application/x-www-form-urlencoded" },
				body: new URLSearchParams({
					code,
					client_id: env.GOOGLE_CLIENT_ID,
					client_secret: env.GOOGLE_CLIENT_SECRET,
					redirect_uri: redirectUri,
					grant_type: "authorization_code",
				}),
			});

			if (!tokenResponse.ok) {
				const tokenErrorText = await tokenResponse.text();
				throw ApiError.unauthorized({
					code: "AUTH.GOOGLE_TOKEN_EXCHANGE_FAILED",
					message: "Failed to exchange Google auth code",
					details: { tokenError: tokenErrorText },
				});
			}

			const tokenPayload = await tokenResponse.json();
			if (!tokenPayload.access_token) {
				throw ApiError.unauthorized({
					code: "AUTH.GOOGLE_ACCESS_TOKEN_MISSING",
					message: "Google access token was not returned",
				});
			}

			const profileResponse = await fetch(
				"https://www.googleapis.com/oauth2/v2/userinfo",
				{
					headers: {
						Authorization: `Bearer ${tokenPayload.access_token}`,
					},
				}
			);

			if (!profileResponse.ok) {
				const profileErrorText = await profileResponse.text();
				throw ApiError.unauthorized({
					code: "AUTH.GOOGLE_PROFILE_FETCH_FAILED",
					message: "Failed to fetch Google profile",
					details: { profileError: profileErrorText },
				});
			}

			const profilePayload = await profileResponse.json();
			if (!(profilePayload.id && profilePayload.email)) {
				throw ApiError.badRequest({
					code: "AUTH.GOOGLE_PROFILE_INCOMPLETE",
					message: "Google profile is missing required fields",
				});
			}

			profile = {
				id: profilePayload.id,
				displayName: profilePayload.name ?? "Google User",
				emails: [{ value: profilePayload.email }],
			};
		}

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
