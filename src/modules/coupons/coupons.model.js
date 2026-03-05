import { model, Schema } from "mongoose";

const couponSchema = new Schema(
	{
		code: {
			type: String,
			required: [true, "Coupon code is required"],
			unique: true,
			trim: true,
			uppercase: true,
			minlength: [3, "Coupon code must be at least 3 characters"],
			maxlength: [32, "Coupon code must be less than 32 characters"],
		},
		type: {
			type: String,
			enum: ["percentage", "fixed"],
			required: [true, "Coupon type is required"],
		},
		value: {
			type: Number,
			required: [true, "Coupon value is required"],
			min: [0, "Coupon value cannot be negative"],
		},
		is_active: {
			type: Boolean,
			default: true,
		},
		starts_at: {
			type: Date,
			default: null,
		},
		ends_at: {
			type: Date,
			default: null,
		},
		min_order_amount: {
			type: Number,
			default: 0,
			min: [0, "Minimum order amount cannot be negative"],
		},
		usage_limit: {
			type: Number,
			default: null,
			min: [1, "Usage limit must be at least 1"],
		},
		used_count: {
			type: Number,
			default: 0,
			min: [0, "Used count cannot be negative"],
		},
		per_user_limit: {
			type: Number,
			default: 1,
			min: [1, "Per-user limit must be at least 1"],
		},
		usage_by_user: {
			type: Map,
			of: Number,
			default: {},
		},
		deletedAt: {
			type: Date,
			default: null,
		},
	},
	{ timestamps: true }
);

const CouponModel = model("Coupon", couponSchema);

export default CouponModel;
