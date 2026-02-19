import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { requireRole } from "../../middlewares/role.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import * as controller from "./orders.controller.js";
import {
	orderCreateSchema,
	orderIdSchema,
	orderStatusSchema,
} from "./orders.validation.js";

const orderRouter = Router();

// POST /api/orders — create order from cart [auth]
orderRouter.post(
	"/",
	requireAuth,
	validate({ body: orderCreateSchema }),
	controller.createOrder
);

// GET /api/orders/me — list current user's orders [auth]
orderRouter.get("/me", requireAuth, controller.listMyOrders);

// GET /api/orders — list all orders [admin]
orderRouter.get(
	"/",
	requireAuth,
	requireRole("admin"),
	controller.listAllOrders
);

// GET /api/orders/:id — get order by id [auth, owner or admin]
orderRouter.get(
	"/:id",
	requireAuth,
	validate({ params: orderIdSchema }),
	controller.getOrderById
);

// PUT /api/orders/:id/status — update order status [admin]
orderRouter.put(
	"/:id/status",
	requireAuth,
	requireRole("admin"),
	validate({ params: orderIdSchema, body: orderStatusSchema }),
	controller.updateOrderStatus
);

export default orderRouter;
