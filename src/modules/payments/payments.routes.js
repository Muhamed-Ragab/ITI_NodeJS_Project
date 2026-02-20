import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import * as controller from "./payments.controller.js";
import { paymentIntentSchema } from "./payments.validation.js";

const paymentRouter = Router();

paymentRouter.post(
	"/create-payment-intent",
	requireAuth,
	validate({ body: paymentIntentSchema }),
	controller.createPaymentIntent
);

paymentRouter.post("/webhook", controller.stripeWebhook);

export default paymentRouter;
