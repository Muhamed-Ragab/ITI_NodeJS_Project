import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

// User Schema (minimal version for seeding)
const userSchema = new mongoose.Schema(
	{
		name: { type: String, required: true, trim: true },
		email: {
			type: String,
			required: true,
			unique: true,
			lowercase: true,
			trim: true,
		},
		password: { type: String, required: true },
		phone: { type: String, sparse: true, trim: true },
		isEmailVerified: { type: Boolean, default: false },
		role: {
			type: String,
			enum: ["customer", "seller", "admin"],
			default: "customer",
		},
		addresses: [
			{
				street: String,
				city: String,
				country: String,
				zip: String,
			},
		],
		wallet_balance: { type: Number, default: 0 },
		seller_profile: {
			store_name: String,
			bio: String,
			approval_status: {
				type: String,
				enum: ["none", "pending", "approved", "rejected"],
				default: "none",
			},
		},
		loyalty_points: { type: Number, default: 0 },
		referral_code: String,
	},
	{ timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", userSchema);

// Single password for all users
const UNIFIED_PASSWORD = "Password@123";

async function seedUsers() {
	try {
		const mongoUri =
			process.env.MONGODB_URI || "mongodb://localhost:27017/ecommerce";

		console.log("Connecting to MongoDB...");
		await mongoose.connect(mongoUri);
		console.log("Connected to MongoDB");

		// Clear existing users
		console.log("Clearing existing users...");
		await User.deleteMany({});
		console.log("Existing users cleared");

		// Hash password directly
		const hashedPassword = await bcrypt.hash(UNIFIED_PASSWORD, 10);

		// Prepare users with hashed password
		const users = [
			// Admin
			{
				name: "Admin User",
				email: "admin@example.com",
				password: hashedPassword,
				phone: "+201000000001",
				role: "admin",
				isEmailVerified: true,
				wallet_balance: 0,
				addresses: [
					{
						street: "123 Admin Street",
						city: "Cairo",
						country: "Egypt",
						zip: "11511",
					},
				],
			},
			// Seller
			{
				name: "John Seller",
				email: "seller@example.com",
				password: hashedPassword,
				phone: "+201000000002",
				role: "seller",
				isEmailVerified: true,
				wallet_balance: 5000,
				seller_profile: {
					store_name: "John's Electronics",
					bio: "Best electronics in town",
					approval_status: "approved",
				},
				addresses: [
					{
						street: "456 Seller Ave",
						city: "Alexandria",
						country: "Egypt",
						zip: "21500",
					},
				],
			},
			// Customer
			{
				name: "Alice Customer",
				email: "customer@example.com",
				password: hashedPassword,
				phone: "+201000000010",
				role: "customer",
				isEmailVerified: true,
				wallet_balance: 2500,
				loyalty_points: 150,
				addresses: [
					{
						street: "101 Customer Lane",
						city: "Cairo",
						country: "Egypt",
						zip: "11511",
					},
				],
			},
		];

		// Insert new users
		console.log("Seeding users...");
		const createdUsers = await User.insertMany(users);

		console.log("\n✅ Users seeded successfully!");
		console.log("\nCreated users (all using same password):");
		console.log("- 1 Admin: admin@example.com");
		console.log("- 1 Seller: seller@example.com");
		console.log("- 1 Customer: customer@example.com");
		console.log(`\nUnified password: ${UNIFIED_PASSWORD}`);

		// Display created users
		for (const user of createdUsers) {
			console.log(`\n${user.role.toUpperCase()}: ${user.email}`);
		}

		await mongoose.disconnect();
		console.log("\nDisconnected from MongoDB");
		process.exit(0);
	} catch (error) {
		console.error("❌ Error seeding users:", error);
		process.exit(1);
	}
}

seedUsers();
