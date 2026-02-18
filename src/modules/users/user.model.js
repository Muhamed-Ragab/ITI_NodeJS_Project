import bcrypt from "bcryptjs";
import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
	street: { type: String, trim: true },
	city: { type: String, trim: true },
	country: { type: String, trim: true },
	zip: { type: String, trim: true },
});

const userSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, "Name is required"],
			trim: true,
			minlength: [2, "Name must be at least 2 characters"],
			maxlength: [50, "Name must be less than 50 characters"],
		},
		email: {
			type: String,
			required: [true, "Email is required"],
			unique: true,
			trim: true,
			lowercase: true,
			match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
		},
		password: {
			type: String,
			select: false,
		},
		googleId: {
			type: String,
			unique: true,
			sparse: true,
		},
		addresses: [addressSchema],
		role: {
			type: String,
			enum: ["member", "admin"],
			default: "member",
		},
		wishlist: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "Product",
			},
		],
		cart: [
			{
				product: {
					type: mongoose.Schema.Types.ObjectId,
					ref: "Product",
				},
				quantity: {
					type: Number,
					default: 1,
					min: [1, "Quantity cannot be less than 1"],
				},
			},
		],
	},
	{
		timestamps: true,
	}
);

userSchema.pre("save", async function (next) {
	if (!(this.isModified("password") && this.password)) {
		return next();
	}
	this.password = await bcrypt.hash(this.password, 10);
	next();
});

userSchema.pre("findOneAndUpdate", async function (next) {
	const update = this.getUpdate();
	if (update?.password) {
		update.password = await bcrypt.hash(update.password, 10);
	}
	next();
});

const User = mongoose.model("User", userSchema);
export default User;
