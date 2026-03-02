import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { requireRole } from "../../middlewares/role.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import * as couponsController from "./coupons.controller.js";
import {
	couponCreateSchema,
	couponIdSchema,
	couponListQuerySchema,
	couponUpdateSchema,
	couponValidateSchema,
} from "./coupons.validation.js";

const couponsRouter = Router();

couponsRouter.post(
	"/validate",
	requireAuth,
	validate({ body: couponValidateSchema }),
	couponsController.validateCoupon
);

couponsRouter.post(
	"/",
	requireAuth,
	requireRole("admin"),
	validate({ body: couponCreateSchema }),
	couponsController.createCoupon
);

couponsRouter.get(
	"/",
	requireAuth,
	requireRole("admin"),
	validate({ query: couponListQuerySchema }),
	couponsController.listCoupons
);

couponsRouter.get(
	"/:id",
	requireAuth,
	requireRole("admin"),
	validate({ params: couponIdSchema }),
	couponsController.getCouponById
);

couponsRouter.put(
	"/:id",
	requireAuth,
	requireRole("admin"),
	validate({ params: couponIdSchema, body: couponUpdateSchema }),
	couponsController.updateCoupon
);

couponsRouter.delete(
	"/:id",
	requireAuth,
	requireRole("admin"),
	validate({ params: couponIdSchema }),
	couponsController.deleteCoupon
);

export default couponsRouter;
