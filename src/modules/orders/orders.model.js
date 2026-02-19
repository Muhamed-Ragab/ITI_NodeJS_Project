import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
	{
		product: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Product",
			required: true,
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

const paymentInfoSchema = new mongoose.Schema(
	{
		stripe_payment_intent_id: { type: String },
		status: { type: String },
		method: { type: String },
	},
	{ _id: false }
);

const orderSchema = new mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		total_amount: {
			type: Number,
			required: true,
			min: 0,
		},
		status: {
			type: String,
			enum: ["pending", "paid", "shipped", "delivered", "cancelled"],
			default: "pending",
		},
		shipping_address: shippingAddressSchema,
		items: [orderItemSchema],
		payment_info: paymentInfoSchema,
	},
	{ timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);
export default Order;
