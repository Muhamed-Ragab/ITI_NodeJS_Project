import { Router } from "express";
import { validate } from "../../middlewares/validate.middleware.js";
import { getProfile, updateProfile } from "./users.controller.js";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { profileUpdateSchema } from "./users.validation.js";

const router = Router();

router.get("/profile", requireAuth, getProfile);
router.put(
	"/profile",
	requireAuth,
	validate({ body: profileUpdateSchema }),
	updateProfile
);

export default router;
