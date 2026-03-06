import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { requireRole } from "../../middlewares/role.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import * as controller from "./payments.controller.js";
import {
  guestPaymentCheckoutSchema,
  paymentCheckoutSchema,
  paymentsAdminQuerySchema,
} from "./payments.validation.js";

const paymentsRouter = Router();

// POST /api/payments/checkout — process checkout payment [auth]
paymentsRouter.post(
  "/checkout",
  requireAuth,
  validate({ body: paymentCheckoutSchema }),
  controller.processCheckoutPayment
);

// POST /api/payments/guest-checkout — process guest checkout payment [public]
paymentsRouter.post(
  "/guest-checkout",
  validate({ body: guestPaymentCheckoutSchema }),
  controller.processGuestCheckoutPayment
);

// POST /api/payments/stripe/webhook — Stripe webhook handler [public]
paymentsRouter.post("/stripe/webhook", controller.stripeWebhook);

// GET /api/payments — list all payments [admin]
paymentsRouter.get(
  "/",
  requireAuth,
  requireRole("admin"),
  validate({ query: paymentsAdminQuerySchema }),
  controller.listPaymentsForAdmin
);

export default paymentsRouter;
