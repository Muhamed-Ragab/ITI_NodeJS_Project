import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
	{
		product: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Product",
			required: true,
		},
		seller_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: false,
		},
		title: { type: String, required: true },
		price: { type: Number, required: true, min: 0 },
		quantity: { type: Number, required: true, min: 1 },
	},
	{ _id: false }
);

const shippingAddressSchema = new mongoose.Schema(
	{
		street: { type: String, trim: true },
		city: { type: String, trim: true },
		country: { type: String, trim: true },
		zip: { type: String, trim: true },
	},
	{ _id: false }
);

const guestInfoSchema = new mongoose.Schema(
	{
		name: { type: String, trim: true },
		email: { type: String, trim: true, lowercase: true },
		phone: { type: String, trim: true },
	},
	{ _id: false }
);

const paymentInfoSchema = new mongoose.Schema(
	{
		stripe_payment_intent_id: { type: String },
		status: { type: String },
		method: { type: String },
	},
	{ _id: false }
);

const couponInfoSchema = new mongoose.Schema(
	{
		code: { type: String },
		type: { type: String, enum: ["percentage", "fixed"] },
		value: { type: Number, min: 0 },
		discount_amount: { type: Number, min: 0 },
	},
	{ _id: false }
);

const statusTimelineSchema = new mongoose.Schema(
	{
		status: {
			type: String,
			enum: ["pending", "paid", "shipped", "delivered", "cancelled"],
			required: true,
		},
		changed_at: {
			type: Date,
			required: true,
			default: Date.now,
		},
		source: {
			type: String,
			default: "system",
		},
		note: {
			type: String,
			default: "",
		},
	},
	{ _id: false }
);

const orderSchema = new mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: false,
		},
		guest_info: {
			type: guestInfoSchema,
			default: null,
		},
		total_amount: {
			type: Number,
			required: true,
			min: 0,
		},
		subtotal_amount: {
			type: Number,
			required: true,
			min: 0,
		},
		discount_amount: {
			type: Number,
			default: 0,
			min: 0,
		},
		shipping_amount: {
			type: Number,
			default: 0,
			min: 0,
		},
		tax_amount: {
			type: Number,
			default: 0,
			min: 0,
		},
		coupon_info: {
			type: couponInfoSchema,
			default: null,
		},
		status: {
			type: String,
			enum: ["pending", "paid", "shipped", "delivered", "cancelled"],
			default: "pending",
		},
		status_timeline: {
			type: [statusTimelineSchema],
			default: [],
		},
		shipping_address: shippingAddressSchema,
		items: [orderItemSchema],
		payment_info: paymentInfoSchema,
	},
	{ timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);
export default Order;
