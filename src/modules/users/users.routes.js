import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { requireRole } from "../../middlewares/role.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import * as controller from "./users.controller.js";
import {
	addressIdSchema,
	addressSchema,
	cartItemSchema,
	productIdSchema,
	profileUpdateSchema,
	roleUpdateSchema,
	userIdSchema,
} from "./users.validation.js";

const userRouter = Router();

// Profile
userRouter.get("/profile", requireAuth, controller.getProfile);
userRouter.put(
	"/profile",
	requireAuth,
	validate({ body: profileUpdateSchema }),
	controller.updateProfile
);

// Wishlist
userRouter.get("/wishlist", requireAuth, controller.getWishlist);
userRouter.post(
	"/wishlist",
	requireAuth,
	validate({ body: productIdSchema }),
	controller.addWishlistItem
);
userRouter.delete(
	"/wishlist/:productId",
	requireAuth,
	validate({ params: productIdSchema }),
	controller.removeWishlistItem
);

// Cart
userRouter.get("/cart", requireAuth, controller.getCart);
userRouter.put(
	"/cart",
	requireAuth,
	validate({ body: cartItemSchema }),
	controller.upsertCart
);
userRouter.delete(
	"/cart/:productId",
	requireAuth,
	validate({ params: productIdSchema }),
	controller.removeCartItemController
);

// Addresses
userRouter.post(
	"/address",
	requireAuth,
	validate({ body: addressSchema }),
	controller.addAddress
);
userRouter.put(
	"/address/:addressId",
	requireAuth,
	validate({ params: addressIdSchema, body: addressSchema }),
	controller.updateAddress
);
userRouter.delete(
	"/address/:addressId",
	requireAuth,
	validate({ params: addressIdSchema }),
	controller.removeAddress
);

// Admin
userRouter.get("/", requireAuth, requireRole("admin"), controller.listUsers);
userRouter.put(
	"/admin/:id/role",
	requireAuth,
	requireRole("admin"),
	validate({ params: userIdSchema, body: roleUpdateSchema }),
	controller.updateRole
);

export default userRouter;
