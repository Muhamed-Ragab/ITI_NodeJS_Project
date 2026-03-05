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

const paymentRouter = Router();

paymentRouter.post(
	"/checkout",
	requireAuth,
	validate({ body: paymentCheckoutSchema }),
	controller.processCheckoutPayment,
);

paymentRouter.post(
	"/guest-checkout",
	validate({ body: guestPaymentCheckoutSchema }),
	controller.processGuestCheckoutPayment,
);

paymentRouter.get(
	"/admin",
	requireAuth,
	requireRole("admin"),
	validate({ query: paymentsAdminQuerySchema }),
	controller.listPaymentsForAdmin,
);

paymentRouter.post("/webhook", controller.stripeWebhook);

export default paymentRouter;
