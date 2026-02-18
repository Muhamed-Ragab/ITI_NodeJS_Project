import { Router } from "express";
import { validate } from "../../middlewares/validate.middleware.js";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { profileUpdateSchema } from "./users.validation.js";
import * as controller from "./users.controller.js";

const router = Router();

// Profile
router.get("/profile", requireAuth, controller.getProfile);
router.put("/profile", requireAuth, validate({ body: profileUpdateSchema }), controller.updateProfile);

// Wishlist
router.get("/wishlist", requireAuth, controller.getWishlist);
router.post("/wishlist", requireAuth, controller.addWishlistItem);
router.delete("/wishlist/:productId", requireAuth, controller.removeWishlistItem);

// Cart
router.get("/cart", requireAuth, controller.getCart);
router.put("/cart", requireAuth, controller.upsertCart);
router.delete("/cart/:productId", requireAuth, controller.removeCartItemController);

export default router;
