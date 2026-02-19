import express, { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import * as controller from "./payments.controller.js";
import { paymentIntentSchema } from "./payments.validation.js";

const paymentRouter = Router();

// POST /api/payments/create-payment-intent — create payment intent [auth]
paymentRouter.post(
	"/create-payment-intent",
	requireAuth,
	validate({ body: paymentIntentSchema }),
	controller.createPaymentIntent
);

// POST /api/payments/webhook — Stripe webhook endpoint [public, no auth]
// IMPORTANT: Stripe webhooks require raw body for signature verification.
// Since express.json() is applied globally in app.js, the webhook route needs
// special handling. The raw body middleware (express.raw()) must be applied
// BEFORE express.json() in app.js for this route to work correctly.
// Alternatively, configure app.js to conditionally apply express.json() excluding /api/payments/webhook
paymentRouter.post("/webhook", controller.stripeWebhook);

export default paymentRouter;
