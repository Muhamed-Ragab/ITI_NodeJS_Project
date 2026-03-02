import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import {
	googleCallback,
	googleStart,
	login,
	loginWithEmailOtp,
	logout,
	register,
	requestEmailOtp,
	verifyEmail,
} from "./auth.controller.js";
import {
	emailLoginSchema,
	emailRequestOtpSchema,
	googleCallbackSchema,
	loginSchema,
	registerSchema,
	verifyEmailSchema,
} from "./auth.validation.js";

const authRouter = Router();

authRouter.post("/register", validate({ body: registerSchema }), register);
authRouter.post("/login", validate({ body: loginSchema }), login);
authRouter.post(
	"/email/request-otp",
	validate({ body: emailRequestOtpSchema }),
	requestEmailOtp
);
authRouter.post(
	"/email/login",
	validate({ body: emailLoginSchema }),
	loginWithEmailOtp
);
authRouter.post("/logout", requireAuth, logout);
authRouter.get(
	"/verify-email",
	validate({ query: verifyEmailSchema }),
	verifyEmail
);

authRouter.get("/google", googleStart);
authRouter.get(
	"/google/callback",
	validate({ query: googleCallbackSchema }),
	googleCallback
);

export default authRouter;
