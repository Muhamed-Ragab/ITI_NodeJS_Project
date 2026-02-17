import {
  registerUser,
  loginUser,
  handleGoogleCallback,
} from "./auth.service.js";
import { sendSuccess } from "../../utils/response.js";
import { ApiError } from "../../utils/errors/api-error.js";

export const register = async (req, res, next) => {
  try {
    const result = await registerUser(req.body);
    sendSuccess(res, { data: result, message: "Registered successfully" });
  } catch (err) {
    next(err instanceof ApiError ? err : ApiError.internal({ details: err.message }));
  }
};

export const login = async (req, res, next) => {
  try {
    const result = await loginUser(req.body);
    sendSuccess(res, { data: result, message: "Logged in successfully" });
  } catch (err) {
    next(err instanceof ApiError ? err : ApiError.internal({ details: err.message }));
  }
};

export const googleStart = (_req, res) => {
  // Replace with real OAuth URL in production
  const url = "https://accounts.google.com/o/oauth2/auth?...";
  res.redirect(url);
};

export const googleCallback = async (req, res, next) => {
  try {
    const { code } = req.query; // validate using schema
    const profile = {
      id: "123",
      displayName: "Test User",
      emails: [{ value: "test@gmail.com" }],
    };
    const result = await handleGoogleCallback(profile);
    sendSuccess(res, { data: result });
  } catch (err) {
    next(err instanceof ApiError ? err : ApiError.internal({ details: err.message }));
  }
};
