import bcrypt from "bcryptjs";
import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
	street: { type: String, trim: true },
	city: { type: String, trim: true },
	country: { type: String, trim: true },
	zip: { type: String, trim: true },
});

const savedPaymentMethodSchema = new mongoose.Schema(
	{
		provider: {
			type: String,
			enum: ["stripe", "paypal", "card"],
			required: true,
		},
		provider_token: {
			type: String,
			required: true,
		},
		brand: { type: String, trim: true },
		last4: { type: String, trim: true },
		expiry_month: { type: Number, min: 1, max: 12 },
		expiry_year: { type: Number, min: 2024 },
		isDefault: {
			type: Boolean,
			default: false,
		},
	},
	{ _id: true }
);

const payoutRequestSchema = new mongoose.Schema(
	{
		amount: { type: Number, required: true, min: 0.01 },
		status: {
			type: String,
			enum: ["pending", "approved", "rejected", "paid"],
			default: "pending",
		},
		note: { type: String, trim: true, default: "" },
		requested_at: { type: Date, default: Date.now },
		reviewed_at: { type: Date, default: null },
	},
	{ _id: true }
);

const sellerProfileSchema = new mongoose.Schema(
	{
		store_name: { type: String, trim: true },
		bio: { type: String, trim: true },
		payout_method: { type: String, trim: true },
		approval_status: {
			type: String,
			enum: ["none", "pending", "approved", "rejected"],
			default: "none",
		},
		approval_note: { type: String, trim: true },
		requested_at: { type: Date },
		reviewed_at: { type: Date },
		payout_requests: {
			type: [payoutRequestSchema],
			default: [],
		},
	},
	{ _id: false }
);

const marketingPreferencesSchema = new mongoose.Schema(
	{
		push_notifications: {
			type: Boolean,
			default: true,
		},
		email_newsletter: {
			type: Boolean,
			default: false,
		},
		promotional_notifications: {
			type: Boolean,
			default: true,
		},
	},
	{ _id: false }
);

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
		phone: {
			type: String,
			unique: true,
			sparse: true,
			trim: true,
			match: [/^\+?[1-9]\d{7,14}$/, "Please provide a valid phone number"],
		},
		googleId: {
			type: String,
			unique: true,
			sparse: true,
		},
		isEmailVerified: {
			type: Boolean,
			default: false,
		},
		emailVerificationTokenHash: {
			type: String,
			default: null,
			select: false,
		},
		emailVerificationTokenExpiresAt: {
			type: Date,
			default: null,
			select: false,
		},
		emailOtpHash: {
			type: String,
			default: null,
			select: false,
		},
		emailOtpExpiresAt: {
			type: Date,
			default: null,
			select: false,
		},
		addresses: [addressSchema],
		role: {
			type: String,
			enum: ["customer", "seller", "admin"],
			default: "customer",
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
		wallet_balance: {
			type: Number,
			default: 0,
			min: 0,
		},
		saved_payment_methods: {
			type: [savedPaymentMethodSchema],
			default: [],
		},
		seller_profile: {
			type: sellerProfileSchema,
			default: () => ({ approval_status: "none" }),
		},
		preferred_language: {
			type: String,
			enum: ["en", "ar", "fr"],
			default: "en",
		},
		marketing_preferences: {
			type: marketingPreferencesSchema,
			default: () => ({
				push_notifications: true,
				email_newsletter: false,
				promotional_notifications: true,
			}),
		},
		loyalty_points: {
			type: Number,
			default: 0,
			min: 0,
		},
		referral_code: {
			type: String,
			trim: true,
			uppercase: true,
			unique: true,
			sparse: true,
		},
		referred_by: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			default: null,
		},
		referrals_count: {
			type: Number,
			default: 0,
			min: 0,
		},
		tokenVersion: {
			type: Number,
			default: 0,
			min: 0,
		},
		isRestricted: {
			type: Boolean,
			default: false,
		},
		deletedAt: {
			type: Date,
			default: null,
		},
	},
	{
		timestamps: true,
	}
);

userSchema.pre("save", async function () {
	if (!(this.isModified("password") && this.password)) {
		return;
	}

	this.password = await bcrypt.hash(this.password, 10);
});

userSchema.pre("findOneAndUpdate", async function () {
	const update = this.getUpdate();
	if (update?.password) {
		update.password = await bcrypt.hash(update.password, 10);
	}
});

const User = mongoose.model("User", userSchema);
export default User;
