import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { requireRole } from "../../middlewares/role.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import * as controller from "./orders.controller.js";
import {
	guestOrderCreateSchema,
	orderCreateSchema,
	orderIdSchema,
	orderStatusSchema,
	sellerOrderStatusSchema,
} from "./orders.validation.js";

const orderRouter = Router();

// POST /api/orders — create order from cart [auth]
orderRouter.post(
	"/",
	requireAuth,
	validate({ body: orderCreateSchema }),
	controller.createOrder
);

// POST /api/orders/guest — create guest order [public]
orderRouter.post(
	"/guest",
	validate({ body: guestOrderCreateSchema }),
	controller.createGuestOrder
);

// GET /api/orders/me — list current user's orders [auth]
orderRouter.get("/me", requireAuth, controller.listMyOrders);

// GET /api/orders/seller — list seller orders [seller]
orderRouter.get(
	"/seller",
	requireAuth,
	requireRole("seller"),
	controller.listSellerOrders
);

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

// PUT /api/orders/:id/seller-status — update order status [seller]
orderRouter.put(
	"/:id/seller-status",
	requireAuth,
	requireRole("seller"),
	validate({ params: orderIdSchema, body: sellerOrderStatusSchema }),
	controller.updateSellerOrderStatus
);

export default orderRouter;
