import { Router } from "express";
import { validate } from "../../middlewares/validate.middleware.js";
import {
	googleCallback,
	googleStart,
	login,
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

authRouter.get("/google", googleStart);
authRouter.get(
	"/google/callback",
	validate({ query: googleCallbackSchema }),
	googleCallback
);

export default authRouter;
