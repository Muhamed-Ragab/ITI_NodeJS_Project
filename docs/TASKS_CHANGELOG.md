# Tasks Change Log

This document summarizes implementation work across project phases and explains **what each delivered point does in the running system**.

## Scope covered

- Phase 0 → Phase 5 delivery completion.
- API, service, repository, validation, model, testing, and documentation updates.
- Quality-gate verification before delivery.

## Phase-by-phase summary

### Phase 0 — Workflow and deliverables foundation

- Established structured delivery flow (branch-per-feature, PR-driven workflow).
  - **System effect:** each feature is isolated in its own branch and reviewed before merge, reducing regression risk.
- Added presentation and demo support artifacts:
  - `docs/presentation/README.md`
  - `docs/demo-walkthrough.md`
  - **System effect:** team can consistently present architecture, feature coverage, and run a reproducible end-to-end demo.

Code/document snippet:

```md
## Slide 3 — Architecture
- Controller → Service → Repository pattern

## 2) Customer journey
1. Register a new user (`POST /api/auth/register`).
2. Login (`POST /api/auth/login`) and capture JWT.
```

### Phase 1 — MVP and commerce completeness

- Added/finished key capabilities:

1. **Email verification flow**
   - **System behavior:** users receive verification token and cannot complete normal login until email is verified.
2. **Role model alignment (`customer | seller | admin`)**
   - **System behavior:** authorization middleware enforces role-specific access to admin/seller endpoints.
3. **Reviews & ratings support**
   - **System behavior:** customers can submit reviews and product rating aggregates are recalculated after review changes.
4. **Order price snapshot fields**
   - **System behavior:** each order stores immutable subtotal/discount/tax/total details at checkout time.
5. **Coupons/discount validation + management**
   - **System behavior:** coupon validity and discount amounts are verified before checkout total is finalized.
6. **Order status timeline/events**
   - **System behavior:** status transitions are tracked chronologically for audit and order tracking.
7. **Order email notifications**
   - **System behavior:** users receive transactional notifications when important order status changes happen.
8. **Admin user restriction and soft delete**
   - **System behavior:** admin can restrict/soft-delete accounts without physical data removal, and token version invalidates active sessions.

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

1. **Email OTP login flow**
   - **System behavior:** users can request OTP and authenticate through email code as an alternative login path.
2. **Guest checkout**
   - **System behavior:** non-authenticated customers can place orders by providing guest and shipping data.
3. **Multi-method checkout (`stripe`, `paypal`, `cod`, `wallet`)**
   - **System behavior:** checkout service normalizes payment method and runs method-specific flow/status update.
4. **Saved payment methods user APIs**
   - **System behavior:** authenticated users can manage reusable payment method records and set default method.

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

1. **Admin promotions management**
   - **System behavior:** admins can create/update/list/delete coupon configurations used by checkout discounts.
2. **Homepage/banner content management**
   - **System behavior:** admins can publish and update content sections used by storefront pages.
3. **Seller onboarding + admin approval**
   - **System behavior:** user requests seller status; admin reviews and approves/rejects onboarding.
4. **Seller order processing/status updates**
   - **System behavior:** sellers can move owned order items through seller-specific lifecycle states.
5. **Seller payout request/review flow**
   - **System behavior:** sellers submit payout requests and admins review payout status with notes.

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

1. **Marketing preferences endpoint**
   - `PATCH /api/users/preferences/marketing`
   - **System behavior:** stores user opt-in/opt-out preferences for promotional channels.
2. **Preferred language endpoint**
   - `PATCH /api/users/preferences/language`
   - **System behavior:** updates per-user locale preference for localized UI/content behavior.
3. **Loyalty summary endpoint**
   - `GET /api/users/loyalty`
   - **System behavior:** returns current loyalty points and program summary for authenticated user.
4. **Referral apply + summary endpoints**
   - `POST /api/users/referrals/apply`
   - `GET /api/users/referrals`
   - **System behavior:** applies referral code with validation and exposes referral/reward history state.
5. **Admin loyalty grant endpoint**
   - `PATCH /api/users/admin/:id/loyalty`
   - **System behavior:** admin can add points to a user and persist reason metadata.
6. **Admin marketing broadcast simulation endpoint**
   - `POST /api/users/admin/marketing/broadcast`
   - **System behavior:** triggers campaign simulation that targets users based on marketing preferences.

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
  - **System effect:** presentation narrative maps directly to implemented modules and routes.
- Expanded `docs/demo-walkthrough.md` with end-to-end demo flow including Phase 4 endpoints.
  - **System effect:** demo can execute real API sequence from authentication to admin operations.

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
  - **System effect:** endpoint expectations and request/response contracts are aligned with implementation.
- Added this change log (`docs/TASKS_CHANGELOG.md`) as consolidated implementation history.
  - **System effect:** feature traceability from phase goals to code and docs is explicit.
- Updated Postman collection to include engagement, checkout, admin/seller, coupons/content/reviews endpoints.
  - **System effect:** QA and demos can execute full project surface from Postman without manual request creation.

Contract snippet:

```md
- Marketing & engagement:
  - PATCH /api/users/preferences/marketing
  - PATCH /api/users/preferences/language
  - GET /api/users/loyalty
  - POST /api/users/referrals/apply
```

## Postman collection updates

Updated `MEAN_E-Commerce_API.postman_collection.json` with:

- Auth: Request Email OTP, Login With Email OTP, Verify Email.
- Users: restriction/soft-delete, saved payment methods, seller onboarding/payout review, marketing & loyalty endpoints.
- Orders: guest order, seller orders list, seller status update.
- Payments: checkout payment endpoint for multi-method flow.
- New folders: Coupons, Content, Reviews.

**System effect:** API regression checks and stakeholder demos can cover all implemented business flows with predefined requests and variables.

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