import { ApiError } from "../../utils/errors/api-error.js";
import * as couponsRepository from "./coupons.repository.js";

const getUserCouponUsage = (coupon, userId) => {
	const key = String(userId);
	return coupon.usage_by_user?.get(key) ?? 0;
};

const ensureCouponIsUsable = (coupon, userId, subtotalAmount) => {
	if (!coupon.is_active) {
		throw ApiError.badRequest({
			code: "COUPON.INACTIVE",
			message: "Coupon is inactive",
		});
	}

	const now = new Date();
	if (coupon.starts_at && new Date(coupon.starts_at) > now) {
		throw ApiError.badRequest({
			code: "COUPON.NOT_STARTED",
			message: "Coupon is not active yet",
		});
	}

	if (coupon.ends_at && new Date(coupon.ends_at) < now) {
		throw ApiError.badRequest({
			code: "COUPON.EXPIRED",
			message: "Coupon has expired",
		});
	}

	if ((coupon.min_order_amount ?? 0) > subtotalAmount) {
		throw ApiError.badRequest({
			code: "COUPON.MIN_ORDER_NOT_MET",
			message: "Order amount does not meet coupon minimum",
			details: {
				minOrderAmount: coupon.min_order_amount,
				subtotalAmount,
			},
		});
	}

	if (coupon.usage_limit !== null && coupon.used_count >= coupon.usage_limit) {
		throw ApiError.badRequest({
			code: "COUPON.USAGE_LIMIT_REACHED",
			message: "Coupon usage limit has been reached",
		});
	}

	const currentUserUsage = getUserCouponUsage(coupon, userId);
	if (currentUserUsage >= coupon.per_user_limit) {
		throw ApiError.badRequest({
			code: "COUPON.USER_LIMIT_REACHED",
			message: "You have reached this coupon usage limit",
		});
	}
};

const calculateDiscountAmount = (coupon, subtotalAmount) => {
	if (coupon.type === "percentage") {
		const rawDiscount = subtotalAmount * (coupon.value / 100);
		return Number(Math.min(rawDiscount, subtotalAmount).toFixed(2));
	}

	return Number(Math.min(coupon.value, subtotalAmount).toFixed(2));
};

export const createCoupon = async (couponData) => {
	const existing = await couponsRepository.findByCode(couponData.code);
	if (existing) {
		throw ApiError.badRequest({
			code: "COUPON.CODE_EXISTS",
			message: "Coupon code already exists",
		});
	}

	return await couponsRepository.create(couponData);
};

export const getCouponById = async (couponId) => {
	const coupon = await couponsRepository.findById(couponId);
	if (!coupon) {
		throw ApiError.notFound({
			code: "COUPON.NOT_FOUND",
			message: "Coupon not found",
			details: { couponId },
		});
	}

	return coupon;
};

export const listCoupons = async (filters = {}) => {
	return await couponsRepository.list(filters);
};

export const updateCoupon = async (couponId, couponData) => {
	if (couponData.code) {
		const existing = await couponsRepository.findByCode(couponData.code);
		if (existing && String(existing._id) !== String(couponId)) {
			throw ApiError.badRequest({
				code: "COUPON.CODE_EXISTS",
				message: "Coupon code already exists",
			});
		}
	}

	const updated = await couponsRepository.updateById(couponId, couponData);
	if (!updated) {
		throw ApiError.notFound({
			code: "COUPON.NOT_FOUND",
			message: "Coupon not found",
			details: { couponId },
		});
	}

	return updated;
};

export const deleteCoupon = async (couponId) => {
	const deleted = await couponsRepository.softDeleteById(couponId);
	if (!deleted) {
		throw ApiError.notFound({
			code: "COUPON.NOT_FOUND",
			message: "Coupon not found",
			details: { couponId },
		});
	}

	return deleted;
};

export const validateCouponForOrder = async ({
	code,
	userId,
	subtotalAmount,
}) => {
	const coupon = await couponsRepository.findByCode(code);
	if (!coupon) {
		throw ApiError.notFound({
			code: "COUPON.NOT_FOUND",
			message: "Coupon not found",
			details: { code },
		});
	}

	ensureCouponIsUsable(coupon, userId, subtotalAmount);

	const discountAmount = calculateDiscountAmount(coupon, subtotalAmount);

	return {
		coupon,
		discountAmount,
		couponInfo: {
			code: coupon.code,
			type: coupon.type,
			value: coupon.value,
			discount_amount: discountAmount,
		},
	};
};

export const consumeCouponUsage = async (couponId, userId) => {
	const consumed = await couponsRepository.consumeUsage(couponId, userId);
	if (!consumed) {
		throw ApiError.notFound({
			code: "COUPON.NOT_FOUND",
			message: "Coupon not found",
			details: { couponId },
		});
	}

	return consumed;
};
