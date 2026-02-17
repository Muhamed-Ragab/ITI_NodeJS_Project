import { Router } from "express";
import { validate } from "../../middlewares/validate.middleware.js";
import {
  register,
  login,
  googleStart,
  googleCallback,
} from "./auth.controller.js";
import { registerSchema, loginSchema, googleCallbackSchema } from "./auth.validation.js";

const router = Router();

router.post("/register", validate({ body: registerSchema }), register);
router.post("/login", validate({ body: loginSchema }), login);

router.get("/google", googleStart);
router.get("/google/callback", validate({ query: googleCallbackSchema }), googleCallback);

export default router;
