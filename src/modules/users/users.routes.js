import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { requireRole } from "../../middlewares/role.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import * as controller from "./users.controller.js";
import {
	addressIdSchema,
	addressSchema,
	cartItemSchema,
	loyaltyGrantSchema,
	marketingBroadcastSchema,
	marketingPreferencesSchema,
	payoutRequestCreateSchema,
	payoutRequestIdSchema,
	payoutReviewSchema,
	preferredLanguageSchema,
	productIdSchema,
	profileUpdateSchema,
	referralApplySchema,
	restrictionUpdateSchema,
	roleUpdateSchema,
	savedPaymentMethodCreateSchema,
	savedPaymentMethodIdSchema,
	sellerApprovalSchema,
	sellerOnboardingRequestSchema,
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
userRouter.patch(
	"/admin/:id/restriction",
	requireAuth,
	requireRole("admin"),
	validate({ params: userIdSchema, body: restrictionUpdateSchema }),
	controller.setUserRestriction
);
userRouter.delete(
	"/admin/:id",
	requireAuth,
	requireRole("admin"),
	validate({ params: userIdSchema }),
	controller.softDeleteUser
);

// Saved payment methods
userRouter.get(
	"/payment-methods",
	requireAuth,
	controller.listSavedPaymentMethods
);
userRouter.post(
	"/payment-methods",
	requireAuth,
	validate({ body: savedPaymentMethodCreateSchema }),
	controller.addSavedPaymentMethod
);
userRouter.delete(
	"/payment-methods/:methodId",
	requireAuth,
	validate({ params: savedPaymentMethodIdSchema }),
	controller.removeSavedPaymentMethod
);
userRouter.patch(
	"/payment-methods/:methodId/default",
	requireAuth,
	validate({ params: savedPaymentMethodIdSchema }),
	controller.setDefaultSavedPaymentMethod
);

// Seller onboarding
userRouter.post(
	"/seller/onboarding",
	requireAuth,
	validate({ body: sellerOnboardingRequestSchema }),
	controller.requestSellerOnboarding
);
userRouter.get(
	"/admin/seller-requests",
	requireAuth,
	requireRole("admin"),
	controller.listPendingSellerRequests
);
userRouter.patch(
	"/admin/seller-requests/:id",
	requireAuth,
	requireRole("admin"),
	validate({ params: userIdSchema, body: sellerApprovalSchema }),
	controller.reviewSellerOnboarding
);

// Seller payouts
userRouter.post(
	"/seller/payouts",
	requireAuth,
	validate({ body: payoutRequestCreateSchema }),
	controller.createSellerPayoutRequest
);
userRouter.patch(
	"/admin/seller-payouts/:id/:payoutId",
	requireAuth,
	requireRole("admin"),
	validate({
		params: userIdSchema.merge(payoutRequestIdSchema),
		body: payoutReviewSchema,
	}),
	controller.reviewSellerPayoutRequest
);

// Marketing & engagement (Phase 4)
userRouter.patch(
	"/preferences/marketing",
	requireAuth,
	validate({ body: marketingPreferencesSchema }),
	controller.updateMarketingPreferences
);
userRouter.patch(
	"/preferences/language",
	requireAuth,
	validate({ body: preferredLanguageSchema }),
	controller.updatePreferredLanguage
);
userRouter.get("/loyalty", requireAuth, controller.getLoyaltySummary);
userRouter.post(
	"/referrals/apply",
	requireAuth,
	validate({ body: referralApplySchema }),
	controller.applyReferralCode
);
userRouter.get("/referrals", requireAuth, controller.getReferralSummary);
userRouter.patch(
	"/admin/:id/loyalty",
	requireAuth,
	requireRole("admin"),
	validate({ params: userIdSchema, body: loyaltyGrantSchema }),
	controller.grantLoyaltyPoints
);
userRouter.post(
	"/admin/marketing/broadcast",
	requireAuth,
	requireRole("admin"),
	validate({ body: marketingBroadcastSchema }),
	controller.broadcastMarketingMessage
);

export default userRouter;
