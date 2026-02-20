import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import {
	googleCallback,
	googleStart,
	login,
	logout,
	register,
} from "./auth.controller.js";
import {
	googleCallbackSchema,
	loginSchema,
	registerSchema,
} from "./auth.validation.js";

const authRouter = Router();

authRouter.post("/register", validate({ body: registerSchema }), register);
authRouter.post("/login", validate({ body: loginSchema }), login);
authRouter.post("/logout", requireAuth, logout);

authRouter.get("/google", googleStart);
authRouter.get(
	"/google/callback",
	validate({ query: googleCallbackSchema }),
	googleCallback
);

export default authRouter;
