# Tasks Change Log

This document summarizes the implementation work completed across project phases and task-driven branches.

## Scope covered

- Phase 0 → Phase 5 delivery completion.
- API, service, repository, validation, model, testing, and documentation updates.
- Quality-gate verification before delivery.

## Phase-by-phase summary

### Phase 0 — Workflow and deliverables foundation

- Established structured delivery flow (branch-per-feature, PR-driven workflow).
- Added presentation and demo support artifacts:
  - `docs/presentation/README.md`
  - `docs/demo-walkthrough.md`

Code/document snippet:

```md
## Slide 3 — Architecture
- Controller → Service → Repository pattern

## 2) Customer journey
1. Register a new user (`POST /api/auth/register`).
2. Login (`POST /api/auth/login`) and capture JWT.
```

### Phase 1 — MVP and commerce completeness

- Added/finished key capabilities including:
  - email verification flow
  - role model alignment (`customer | seller | admin`)
  - reviews & ratings support
  - order price snapshot fields
  - coupons/discount validation + management
  - order status timeline/events
  - order email notifications
  - admin user restriction and soft delete

Code snippets:

- Email verification flow

```js
authRouter.get(
	"/verify-email",
	validate({ query: verifyEmailSchema }),
	verifyEmail
);

if (!user.isEmailVerified) {
	throw ApiError.unauthorized({
		code: "AUTH.EMAIL_NOT_VERIFIED",
		message: "Please verify your email before login",
	});
}
```

- Role model alignment

```js
role: {
	type: String,
	enum: ["customer", "seller", "admin"],
	default: "customer",
},
```

- Reviews & ratings

```js
reviewsRouter.post("/", requireAuth, validate({ body: reviewCreateSchema }), createReview);

const refreshProductRatingStats = async (productId) => {
	const stats = await reviewsRepository.calculateProductRatingStats(productId);
	await productsRepository.updateRatingStats(productId, stats);
};
```

- Order price snapshot fields

```js
const buildPriceSnapshot = (subtotalAmount, discountAmount = 0, couponInfo = null) => ({
	subtotal_amount: subtotalAmount,
	discount_amount: discountAmount,
	shipping_amount: 0,
	tax_amount: 0,
	total_amount: subtotalAmount - discountAmount,
	coupon_info: couponInfo,
});
```

- Coupons validation + management

```js
couponsRouter.post(
	"/validate",
	requireAuth,
	validate({ body: couponValidateSchema }),
	couponsController.validateCoupon
);
```

- Order status timeline/events

```js
status_timeline: {
	type: [statusTimelineSchema],
	default: [],
},
```

- Order email notifications

```js
await sendOrderStatusNotification({
	orderId: String(order._id),
	status: "pending",
	email: user.email,
	name: user.name,
});
```

- Admin restriction + soft delete

```js
userRouter.patch("/admin/:id/restriction", requireAuth, requireRole("admin"), ...);
userRouter.delete("/admin/:id", requireAuth, requireRole("admin"), ...);

export const softDeleteById = async (userId) => {
	return await User.findOneAndUpdate(
		{ _id: userId, deletedAt: null },
		{ deletedAt: new Date(), isRestricted: true, $inc: { tokenVersion: 1 } },
		{ new: true }
	);
};
```

### Phase 2 — Checkout and payments expansion

- Delivered:
  - email OTP login flow
  - guest checkout
  - multi-method checkout support (`stripe`, `paypal`, `cod`, `wallet`)
  - saved payment methods user APIs

Code snippets:

- Email OTP login flow

```js
authRouter.post("/email/request-otp", validate({ body: emailRequestOtpSchema }), requestEmailOtp);
authRouter.post("/email/login", validate({ body: emailLoginSchema }), loginWithEmailOtp);
```

- Guest checkout

```js
orderRouter.post(
	"/guest",
	validate({ body: guestOrderCreateSchema }),
	controller.createGuestOrder
);
```

- Multi-method checkout (`stripe/paypal/cod/wallet`)

```js
const PAYMENT_METHODS = ["stripe", "paypal", "cod", "wallet"];

if (normalizedMethod === "wallet") {
	await paymentsRepo.updateOrderPaymentStatus(orderId, {
		status: "paid",
		payment_info: { method: "wallet", status: "succeeded" },
	});
}
```

- Saved payment methods user APIs

```js
userRouter.get("/payment-methods", requireAuth, controller.listSavedPaymentMethods);
userRouter.post("/payment-methods", requireAuth, validate({ body: savedPaymentMethodCreateSchema }), controller.addSavedPaymentMethod);
userRouter.delete("/payment-methods/:methodId", requireAuth, validate({ params: savedPaymentMethodIdSchema }), controller.removeSavedPaymentMethod);
```

### Phase 3 — Admin and seller business features

- Delivered:
  - admin promotions management
  - homepage/banner content management
  - seller onboarding + admin approval
  - seller order processing/status updates
  - seller payout request/review flow

Code snippets:

- Admin promotions management

```js
couponsRouter.post("/", requireAuth, requireRole("admin"), validate({ body: couponCreateSchema }), couponsController.createCoupon);
couponsRouter.put("/:id", requireAuth, requireRole("admin"), validate({ params: couponIdSchema, body: couponUpdateSchema }), couponsController.updateCoupon);
```

- Homepage/banner content management

```js
contentRouter.post("/", requireAuth, requireRole("admin"), validate({ body: contentCreateSchema }), controller.createContent);
contentRouter.put("/:id", requireAuth, requireRole("admin"), validate({ params: contentIdSchema, body: contentUpdateSchema }), controller.updateContent);
```

- Seller onboarding + admin approval

```js
userRouter.post("/seller/onboarding", requireAuth, validate({ body: sellerOnboardingRequestSchema }), controller.requestSellerOnboarding);
userRouter.patch("/admin/seller-requests/:id", requireAuth, requireRole("admin"), validate({ params: userIdSchema, body: sellerApprovalSchema }), controller.reviewSellerOnboarding);
```

- Seller order processing/status updates

```js
orderRouter.put(
	"/:id/seller-status",
	requireAuth,
	requireRole("seller"),
	validate({ params: orderIdSchema, body: sellerOrderStatusSchema }),
	controller.updateSellerOrderStatus
);
```

- Seller payout request/review flow

```js
userRouter.post("/seller/payouts", requireAuth, validate({ body: payoutRequestCreateSchema }), controller.createSellerPayoutRequest);
userRouter.patch("/admin/seller-payouts/:id/:payoutId", requireAuth, requireRole("admin"), validate({ params: userIdSchema.merge(payoutRequestIdSchema), body: payoutReviewSchema }), controller.reviewSellerPayoutRequest);
```

### Phase 4 — Engagement, growth, localization

Implemented user engagement and marketing capabilities in users module:

- Marketing preferences endpoint
  - `PATCH /api/users/preferences/marketing`
- Preferred language endpoint
  - `PATCH /api/users/preferences/language`
- Loyalty summary endpoint
  - `GET /api/users/loyalty`
- Referral apply + summary endpoints
  - `POST /api/users/referrals/apply`
  - `GET /api/users/referrals`
- Admin loyalty grant endpoint
  - `PATCH /api/users/admin/:id/loyalty`
- Admin marketing broadcast simulation endpoint
  - `POST /api/users/admin/marketing/broadcast`

Code snippets:

```js
// routes
userRouter.patch("/preferences/marketing", requireAuth, validate({ body: marketingPreferencesSchema }), controller.updateMarketingPreferences);
userRouter.patch("/preferences/language", requireAuth, validate({ body: preferredLanguageSchema }), controller.updatePreferredLanguage);
userRouter.get("/loyalty", requireAuth, controller.getLoyaltySummary);
userRouter.post("/referrals/apply", requireAuth, validate({ body: referralApplySchema }), controller.applyReferralCode);
userRouter.get("/referrals", requireAuth, controller.getReferralSummary);
userRouter.patch("/admin/:id/loyalty", requireAuth, requireRole("admin"), validate({ params: userIdSchema, body: loyaltyGrantSchema }), controller.grantLoyaltyPoints);
userRouter.post("/admin/marketing/broadcast", requireAuth, requireRole("admin"), validate({ body: marketingBroadcastSchema }), controller.broadcastMarketingMessage);
```

```js
// model
preferred_language: { type: String, enum: ["en", "ar", "fr"], default: "en" },
marketing_preferences: { type: marketingPreferencesSchema, default: () => ({ ... }) },
loyalty_points: { type: Number, default: 0, min: 0 },
referral_code: { type: String, trim: true, uppercase: true, unique: true, sparse: true },
```

```js
// repository/service
const rewardPoints = 25;
if (result?.error === "REFERRAL_ALREADY_APPLIED") {
	throw ApiError.badRequest({
		code: "REFERRAL.ALREADY_APPLIED",
		message: "Referral code already applied",
	});
}
```

Implementation touched:

- `src/modules/users/user.model.js`
- `src/modules/users/users.validation.js`
- `src/modules/users/users.repository.js`
- `src/modules/users/users.service.js`
- `src/modules/users/users.controller.js`
- `src/modules/users/users.routes.js`
- `test/modules/users/users.service.test.js`
- `test/modules/users/users.controller.test.js`
- `test/modules/users/users.validation.test.js`

### Phase 5 — Presentation and final demo readiness

- Finalized slide structure and speaker notes in `docs/presentation/README.md`.
- Expanded `docs/demo-walkthrough.md` with end-to-end demo flow including Phase 4 endpoints.

Document snippets:

```md
## Slide 9 — Bonus Features Delivered (Phase 4)
- Marketing preferences endpoints
- Loyalty points summary + admin grant endpoint
- Referral code apply + reward flow
```

```md
## 4) Admin journey
5. Phase 4 marketing/loyalty operations:
   - PATCH /api/users/admin/:id/loyalty
   - POST /api/users/admin/marketing/broadcast
```

## Documentation updates completed

- Updated API contracts in `docs/API_GUIDELINES.md`.
- Added this change log (`docs/TASKS_CHANGELOG.md`) as consolidated implementation history.
- Updated Postman collection to include Phase 4 engagement endpoints.

Contract snippet:

```md
- Marketing & engagement:
  - PATCH /api/users/preferences/marketing
  - PATCH /api/users/preferences/language
  - GET /api/users/loyalty
  - POST /api/users/referrals/apply
```

## Postman collection updates

Updated `MEAN_E-Commerce_API.postman_collection.json` under **Users** with:

- Update Marketing Preferences
- Update Preferred Language
- Get Loyalty Summary
- Apply Referral Code
- Get Referral Summary
- Grant Loyalty Points [Admin]
- Broadcast Marketing Message [Admin]

JSON snippet:

```json
{
  "name": "Get Loyalty Summary",
  "request": {
    "method": "GET",
    "url": {
      "raw": "{{base_url}}/users/loyalty"
    }
  }
}
```

## Quality-gate status

Required gates for release readiness:

```bash
npm run format
npm run lint
npm run build
npm test -- --run
```

All gates are expected to pass before final release PR from `develop` to `main`.

## Release note

If new commits were added to `develop` after an earlier merged release PR, open a fresh `develop -> main` PR to include the latest task/documentation/Postman updates.
