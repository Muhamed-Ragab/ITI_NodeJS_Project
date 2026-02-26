import cors from "cors";
import express from "express";
import morgan from "morgan";
import { API_PREFIX, API_VERSION } from "./config/api-config.js";
import { env } from "./config/env.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import authRouter from "./modules/auth/auth.routes.js";
import categoryRouter from "./modules/categories/categories.routes.js";
import contentRouter from "./modules/content/content.routes.js";
import couponsRouter from "./modules/coupons/coupons.routes.js";
import orderRouter from "./modules/orders/orders.routes.js";
import paymentRouter from "./modules/payments/payments.routes.js";
import productRouter from "./modules/products/products.routes.js";
import reviewsRouter from "./modules/reviews/reviews.routes.js";
import userRouter from "./modules/users/users.routes.js";
import { sendSuccess } from "./utils/response.js";

const app = express();
const appNodeEnv = env?.NODE_ENV ?? process.env.NODE_ENV ?? "development";

// Middleware
app.use(morgan(appNodeEnv === "production" ? "combined" : "dev"));
app.use(
	cors({
		origin:
			appNodeEnv === "production" ? "https://your-frontend-domain.com" : "*",
	})
);

// Stripe webhook needs raw body, so we need to handle it specially
app.use((req, res, next) => {
	if (req.url === `${API_PREFIX}/payments/webhook`) {
		express.raw({ type: "application/json" })(req, res, next);
	} else {
		express.json()(req, res, next);
	}
});
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get("/api", (_req, res) => {
	return sendSuccess(res, {
		data: {
			version: API_VERSION,
			nodeEnv: appNodeEnv,
		},
		message: "API is running!",
	});
});

// Routes (versioned)
app.use(`${API_PREFIX}/categories`, categoryRouter);
app.use(`${API_PREFIX}/products`, productRouter);
app.use(`${API_PREFIX}/reviews`, reviewsRouter);
app.use(`${API_PREFIX}/auth`, authRouter);
app.use(`${API_PREFIX}/users`, userRouter);
app.use(`${API_PREFIX}/coupons`, couponsRouter);
app.use(`${API_PREFIX}/content`, contentRouter);
app.use(`${API_PREFIX}/orders`, orderRouter);

// Payment routes - need special handling for Stripe webhook raw body
app.use(`${API_PREFIX}/payments`, paymentRouter);

// Error Handling
app.use(errorHandler);

export default app;
