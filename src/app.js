import cors from "cors";
import express from "express";
import morgan from "morgan";
import { env } from "./config/env.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import authRouter from "./modules/auth/auth.routes.js";
import categoryRouter from "./modules/categories/categories.routes.js";
import orderRouter from "./modules/orders/orders.routes.js";
import paymentRouter from "./modules/payments/payments.routes.js";
import productRouter from "./modules/products/products.routes.js";
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
	if (req.url === "/api/payments/webhook") {
		express.raw({ type: "application/json" })(req, res, next);
	} else {
		express.json()(req, res, next);
	}
});
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get("/", (_req, res) => {
	return sendSuccess(res, {
		data: {
			version: "1.0.0",
			nodeEnv: appNodeEnv,
		},
		message: "API is running!",
	});
});

// Routes
app.use("/api/categories", categoryRouter);
app.use("/api/products", productRouter);
app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/orders", orderRouter);

// Payment routes - need special handling for Stripe webhook raw body
app.use("/api/payments", paymentRouter);

// Error Handling
app.use(errorHandler);

export default app;
