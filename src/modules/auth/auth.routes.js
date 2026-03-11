import { Router } from "express";
import { asyncHandler } from "../../middlewares/async-handler.middleware.js";
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

authRouter.post(
	"/register",
	validate({ body: registerSchema }),
	asyncHandler(register)
);
authRouter.post("/login", validate({ body: loginSchema }), asyncHandler(login));
authRouter.post(
	"/email/request-otp",
	validate({ body: emailRequestOtpSchema }),
	asyncHandler(requestEmailOtp)
);
authRouter.post(
	"/email/login",
	validate({ body: emailLoginSchema }),
	asyncHandler(loginWithEmailOtp)
);
authRouter.post("/logout", requireAuth, asyncHandler(logout));
authRouter.get(
	"/verify-email",
	validate({ query: verifyEmailSchema }),
	asyncHandler(verifyEmail)
);

authRouter.get("/google", asyncHandler(googleStart));
authRouter.get(
	"/google/callback",
	validate({ query: googleCallbackSchema }),
	asyncHandler(googleCallback)
);

export default authRouter;
