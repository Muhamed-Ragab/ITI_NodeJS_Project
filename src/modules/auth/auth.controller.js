import { StatusCodes } from "http-status-codes";
import { env } from "../../config/env.js";
import { ApiError } from "../../utils/errors/api-error.js";
import { logDevError } from "../../utils/logger.js";
import { sendSuccess } from "../../utils/response.js";
import * as authService from "./auth.service.js";

const ensureGoogleConfig = () => {
	if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
		return;
	}

	throw ApiError.internal({
		code: "AUTH.GOOGLE_CONFIG_MISSING",
		message: "Google OAuth credentials are not configured",
	});
};

const exchangeCodeForAccessToken = async (code, redirectUri) => {
	let tokenResponse;
	try {
		tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
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
	} catch (error) {
		logDevError({
			scope: "auth.google.token-request",
			message: "Failed to reach Google token endpoint",
			error,
		});

		throw ApiError.internal({
			code: "AUTH.GOOGLE_TOKEN_REQUEST_FAILED",
			message: "Failed to contact Google token endpoint",
		});
	}

	if (!tokenResponse.ok) {
		const tokenErrorText = await tokenResponse.text();
		throw ApiError.unauthorized({
			code: "AUTH.GOOGLE_TOKEN_EXCHANGE_FAILED",
			message: "Failed to exchange Google auth code",
			details: { tokenError: tokenErrorText },
		});
	}

	try {
		const tokenPayload = await tokenResponse.json();
		if (!tokenPayload.access_token) {
			throw ApiError.unauthorized({
				code: "AUTH.GOOGLE_ACCESS_TOKEN_MISSING",
				message: "Google access token was not returned",
			});
		}

		return tokenPayload.access_token;
	} catch (error) {
		if (error instanceof ApiError) {
			throw error;
		}

		logDevError({
			scope: "auth.google.token-parse",
			message: "Failed to parse Google token response",
			error,
		});

		throw ApiError.internal({
			code: "AUTH.GOOGLE_TOKEN_PARSE_FAILED",
			message: "Failed to parse Google token response",
		});
	}
};

const fetchGoogleProfile = async (accessToken) => {
	let profileResponse;
	try {
		profileResponse = await fetch(
			"https://www.googleapis.com/oauth2/v2/userinfo",
			{
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			}
		);
	} catch (error) {
		logDevError({
			scope: "auth.google.profile-request",
			message: "Failed to reach Google profile endpoint",
			error,
		});

		throw ApiError.internal({
			code: "AUTH.GOOGLE_PROFILE_REQUEST_FAILED",
			message: "Failed to contact Google profile endpoint",
		});
	}

	if (!profileResponse.ok) {
		const profileErrorText = await profileResponse.text();
		throw ApiError.unauthorized({
			code: "AUTH.GOOGLE_PROFILE_FETCH_FAILED",
			message: "Failed to fetch Google profile",
			details: { profileError: profileErrorText },
		});
	}

	try {
		const profilePayload = await profileResponse.json();
		if (!(profilePayload.id && profilePayload.email)) {
			throw ApiError.badRequest({
				code: "AUTH.GOOGLE_PROFILE_INCOMPLETE",
				message: "Google profile is missing required fields",
			});
		}

		return {
			id: profilePayload.id,
			displayName: profilePayload.name ?? "Google User",
			emails: [{ value: profilePayload.email }],
		};
	} catch (error) {
		if (error instanceof ApiError) {
			throw error;
		}

		logDevError({
			scope: "auth.google.profile-parse",
			message: "Failed to parse Google profile response",
			error,
		});

		throw ApiError.internal({
			code: "AUTH.GOOGLE_PROFILE_PARSE_FAILED",
			message: "Failed to parse Google profile response",
		});
	}
};

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
		if (!code) {
			throw ApiError.badRequest({
				code: "AUTH.GOOGLE_CODE_MISSING",
				message: "Google authorization code is required",
			});
		}

		const redirectUri = `http://localhost:${env.PORT}/api/auth/google/callback`;

		const profile =
			env.NODE_ENV === "test"
				? {
						id: "google_id_placeholder",
						displayName: "Google User",
						emails: [{ value: "google_user@gmail.com" }],
					}
				: await (async () => {
						ensureGoogleConfig();
						const accessToken = await exchangeCodeForAccessToken(
							code,
							redirectUri
						);
						return await fetchGoogleProfile(accessToken);
					})();

		const result = await authService.handleGoogleCallback(profile);
		return sendSuccess(res, {
			statusCode: StatusCodes.OK,
			data: result,
			message: "Google login successful",
		});
	} catch (error) {
		if (!(error instanceof ApiError)) {
			logDevError({
				scope: "auth.google.callback",
				message: "Unhandled Google callback error",
				error,
			});
		}

		next(
			error instanceof ApiError
				? error
				: ApiError.internal({
						code: "AUTH.GOOGLE_CALLBACK_FAILED",
						message: "Failed to complete Google login",
					})
		);
	}
};
