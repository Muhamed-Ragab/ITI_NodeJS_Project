import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { requireRole } from "../../middlewares/role.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import * as controller from "./payments.controller.js";
import {
	paymentCheckoutSchema,
	paymentIntentSchema,
	paymentsAdminQuerySchema,
} from "./payments.validation.js";

const paymentRouter = Router();

paymentRouter.post(
	"/create-payment-intent",
	requireAuth,
	validate({ body: paymentIntentSchema }),
	controller.createPaymentIntent
);

paymentRouter.post(
	"/checkout",
	requireAuth,
	validate({ body: paymentCheckoutSchema }),
	controller.processCheckoutPayment
);

paymentRouter.get(
	"/admin",
	requireAuth,
	requireRole("admin"),
	validate({ query: paymentsAdminQuerySchema }),
	controller.listPaymentsForAdmin
);

paymentRouter.post("/webhook", controller.stripeWebhook);

export default paymentRouter;
