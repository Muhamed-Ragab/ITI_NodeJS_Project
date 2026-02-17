import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
	street: String,
	city: String,
	country: String,
	zip: String,
});

const userSchema = new mongoose.Schema(
	{
		name: { type: String, required: true },
		email: { type: String, required: true, unique: true },
		password: { type: String },
		googleId: { type: String }, // للـ Google OAuth
		address: addressSchema,
		role: { type: String, enum: ["member", "admin"], default: "member" },
		wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
		cart: [
			{
				product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
				quantity: { type: Number, default: 1 },
			},
		],
	},
	{ timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
