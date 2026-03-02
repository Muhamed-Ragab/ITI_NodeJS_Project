import {
	buildPaginationMeta,
	parsePagination,
} from "../../utils/pagination.js";
import CouponModel from "./coupons.model.js";

export const create = async (couponData) => {
	return await CouponModel.create(couponData);
};

export const findById = async (couponId) => {
	return await CouponModel.findOne({
		_id: couponId,
		deletedAt: null,
	});
};

export const findByCode = async (code) => {
	return await CouponModel.findOne({
		code: code.toUpperCase(),
		deletedAt: null,
	});
};

export const updateById = async (couponId, couponData) => {
	return await CouponModel.findOneAndUpdate(
		{ _id: couponId, deletedAt: null },
		couponData,
		{ new: true, runValidators: true }
	);
};

export const softDeleteById = async (couponId) => {
	return await CouponModel.findOneAndUpdate(
		{ _id: couponId, deletedAt: null },
		{ deletedAt: new Date(), is_active: false },
		{ new: true }
	);
};

export const list = async (filters = {}) => {
	const { page, limit, skip } = parsePagination(filters);
	const query = { deletedAt: null };

	if (filters.is_active !== undefined) {
		query.is_active = filters.is_active === "true";
	}

	if (filters.code) {
		query.code = { $regex: filters.code, $options: "i" };
	}

	const [coupons, total] = await Promise.all([
		CouponModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
		CouponModel.countDocuments(query),
	]);

	return {
		coupons,
		pagination: buildPaginationMeta({ page, limit, total }),
	};
};

export const consumeUsage = async (couponId, userId) => {
	const coupon = await findById(couponId);
	if (!coupon) {
		return null;
	}

	const key = String(userId);
	const currentUsed = coupon.usage_by_user?.get(key) ?? 0;
	coupon.usage_by_user.set(key, currentUsed + 1);
	coupon.used_count += 1;

	return await coupon.save();
};
