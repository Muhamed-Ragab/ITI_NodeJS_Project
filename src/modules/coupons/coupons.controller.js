import { StatusCodes } from "http-status-codes";
import { sendSuccess } from "../../utils/response.js";
import * as couponsService from "./coupons.service.js";

export const createCoupon = async (req, res) => {
	const coupon = await couponsService.createCoupon(req.body);

	return sendSuccess(res, {
		statusCode: StatusCodes.CREATED,
		data: coupon,
		message: "Coupon created successfully",
	});
};

export const getCouponById = async (req, res) => {
	const coupon = await couponsService.getCouponById(req.params.id);

	return sendSuccess(res, {
		statusCode: StatusCodes.OK,
		data: coupon,
		message: "Coupon retrieved successfully",
	});
};

export const listCoupons = async (req, res) => {
	const result = await couponsService.listCoupons(req.query);

	return sendSuccess(res, {
		statusCode: StatusCodes.OK,
		data: result,
		message: "Coupons retrieved successfully",
	});
};

export const updateCoupon = async (req, res) => {
	const coupon = await couponsService.updateCoupon(req.params.id, req.body);

	return sendSuccess(res, {
		statusCode: StatusCodes.OK,
		data: coupon,
		message: "Coupon updated successfully",
	});
};

export const deleteCoupon = async (req, res) => {
	const coupon = await couponsService.deleteCoupon(req.params.id);

	return sendSuccess(res, {
		statusCode: StatusCodes.OK,
		data: coupon,
		message: "Coupon deleted successfully",
	});
};

export const validateCoupon = async (req, res) => {
	const result = await couponsService.validateCouponForOrder({
		code: req.body.code,
		userId: req.user.id,
		subtotalAmount: req.body.subtotal_amount,
	});

	return sendSuccess(res, {
		statusCode: StatusCodes.OK,
		data: {
			coupon_info: result.couponInfo,
			discount_amount: result.discountAmount,
		},
		message: "Coupon is valid",
	});
};
