import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import mongoose from "mongoose";

import Category from "../src/modules/categories/categories.model.js";
import Content from "../src/modules/content/content.model.js";
import Coupon from "../src/modules/coupons/coupons.model.js";
import Order from "../src/modules/orders/orders.model.js";
import Product from "../src/modules/products/products.model.js";
import Review from "../src/modules/reviews/reviews.model.js";
import User from "../src/modules/users/user.model.js";

dotenv.config();

// Single password for all users
const UNIFIED_PASSWORD = "Password@123";

// Categories data
const categories = [
	{
		name: "Electronics",
		description: "Latest gadgets and electronic devices",
		slug: "electronics",
		image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400",
	},
	{
		name: "Clothing",
		description: "Fashionable clothes for all ages",
		slug: "clothing",
		image: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400",
	},
	{
		name: "Books",
		description: "Books, magazines and publications",
		slug: "books",
		image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400",
	},
	{
		name: "Home & Garden",
		description: "Everything for your home and garden",
		slug: "home-garden",
		image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400",
	},
	{
		name: "Sports",
		description: "Sports equipment and accessories",
		slug: "sports",
		image: "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=400",
	},
];

// Content data
const contents = [
	{
		section: "homepage",
		title: "Welcome to Our E-Commerce Store",
		slug: "welcome-banner",
		body: "Discover amazing products at great prices. Shop now and enjoy exclusive deals!",
		image_url:
			"https://images.unsplash.com/photo-1607082350899-7e105aa886ae?w=1200",
		is_active: true,
	},
	{
		section: "homepage",
		title: "Summer Sale - Up to 50% Off",
		slug: "summer-sale-banner",
		body: "Don't miss our biggest summer sale of the year. Limited time offer!",
		image_url:
			"https://images.unsplash.com/photo-1607082349566-187342175e2f?w=1200",
		is_active: true,
	},
	{
		section: "banner",
		title: "Free Shipping on Orders Over EGP 1000",
		slug: "free-shipping-banner",
		body: "Enjoy free delivery on all orders over EGP 1000",
		image_url:
			"https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200",
		is_active: true,
	},
];

// Products data
const products = [
	// Electronics (seller: John Seller)
	{
		title: "iPhone 15 Pro Max",
		description:
			"Latest Apple flagship phone with A17 Pro chip, titanium design, and advanced camera system.",
		price: 45_000,
		stock_quantity: 25,
		images: [
			"https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400",
		],
		average_rating: 4.8,
		ratings_count: 156,
	},
	{
		title: "MacBook Air M3",
		description:
			"Supercharged by M3 chip. Up to 18 hours of battery life. Fanless design.",
		price: 52_000,
		stock_quantity: 15,
		images: [
			"https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400",
		],
		average_rating: 4.9,
		ratings_count: 89,
	},
	{
		title: "Sony WH-1000XM5",
		description:
			"Industry-leading noise cancellation with exceptional sound quality.",
		price: 8500,
		stock_quantity: 40,
		images: [
			"https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=400",
		],
		average_rating: 4.7,
		ratings_count: 234,
	},
	{
		title: "Samsung 65-inch OLED TV",
		description: "Self-lit pixels for perfect blacks and cinematic colors.",
		price: 35_000,
		stock_quantity: 10,
		images: [
			"https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400",
		],
		average_rating: 4.6,
		ratings_count: 67,
	},
	// Clothing (seller: Sarah Seller)
	{
		title: "Premium Cotton T-Shirt",
		description:
			"100% organic cotton, comfortable fit, perfect for everyday wear.",
		price: 450,
		stock_quantity: 200,
		images: [
			"https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400",
		],
		average_rating: 4.3,
		ratings_count: 89,
	},
	{
		title: "Designer Denim Jeans",
		description: "Classic fit denim jeans with modern styling.",
		price: 1200,
		stock_quantity: 80,
		images: ["https://images.unsplash.com/photo-1542272604-787c3835535d?w=400"],
		average_rating: 4.5,
		ratings_count: 156,
	},
	{
		title: "Wool Winter Coat",
		description: "Premium wool blend coat, warm and stylish for winter season.",
		price: 3500,
		stock_quantity: 30,
		images: [
			"https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=400",
		],
		average_rating: 4.7,
		ratings_count: 45,
	},
	{
		title: "Running Sneakers",
		description: "Lightweight, breathable running shoes with cushioned sole.",
		price: 1800,
		stock_quantity: 120,
		images: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400"],
		average_rating: 4.4,
		ratings_count: 203,
	},
	// Books
	{
		title: "The Great Gatsby",
		description: "Classic novel by F. Scott Fitzgerald.",
		price: 150,
		stock_quantity: 500,
		images: ["https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400"],
		average_rating: 4.6,
		ratings_count: 890,
	},
	{
		title: "Atomic Habits",
		description: "Build good habits and break bad ones.",
		price: 350,
		stock_quantity: 300,
		images: [
			"https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400",
		],
		average_rating: 4.8,
		ratings_count: 1250,
	},
	// Home & Garden
	{
		title: "Smart LED Lamp",
		description: "WiFi-enabled smart lamp with color options.",
		price: 800,
		stock_quantity: 75,
		images: [
			"https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400",
		],
		average_rating: 4.2,
		ratings_count: 67,
	},
	{
		title: "Indoor Plant Set",
		description: "Set of 3 easy-care indoor plants with pots.",
		price: 650,
		stock_quantity: 50,
		images: [
			"https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=400",
		],
		average_rating: 4.5,
		ratings_count: 89,
	},
	// Sports
	{
		title: "Professional Football",
		description: "Official size and weight, durable construction.",
		price: 450,
		stock_quantity: 100,
		images: [
			"https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=400",
		],
		average_rating: 4.6,
		ratings_count: 178,
	},
	{
		title: "Yoga Mat Premium",
		description: "Non-slip, eco-friendly yoga mat with carrying strap.",
		price: 380,
		stock_quantity: 150,
		images: [
			"https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400",
		],
		average_rating: 4.7,
		ratings_count: 234,
	},
];

// Reviews data
const reviews = [
	{ rating: 5, comment: "Amazing phone! Best I've ever owned." },
	{ rating: 4, comment: "Great phone but a bit expensive." },
	{ rating: 5, comment: "Perfect for my needs. Battery life is excellent." },
	{ rating: 5, comment: "Worth every penny!" },
	{ rating: 4, comment: "Good quality, fast delivery." },
	{ rating: 3, comment: "It's okay, expected better." },
	{ rating: 5, comment: "Excellent product, highly recommended!" },
	{ rating: 4, comment: "Good value for money." },
];

// Coupons data
const coupons = [
	{
		code: "WELCOME20",
		description: "20% off for new customers",
		type: "percentage",
		value: 20,
		min_order_amount: 500,
		max_uses: 100,
		expires_at: new Date("2026-12-31"),
	},
	{
		code: "FLAT500",
		description: "EGP 500 off on orders above EGP 3000",
		type: "fixed",
		value: 500,
		min_order_amount: 3000,
		max_uses: 50,
		expires_at: new Date("2026-06-30"),
	},
	{
		code: "SUMMER15",
		description: "15% off summer sale",
		type: "percentage",
		value: 15,
		min_order_amount: 0,
		max_uses: 200,
		expires_at: new Date("2026-08-31"),
	},
];

// ============== MAIN SEED FUNCTION ==============
async function seedAll() {
	try {
		const mongoUri =
			process.env.MONGODB_URI || "mongodb://localhost:27017/ecommerce";

		console.log("🔌 Connecting to MongoDB...");
		await mongoose.connect(mongoUri);
		console.log("✅ Connected to MongoDB\n");

		// Clear existing data
		console.log("🗑️  Clearing existing data...");
		await Promise.all([
			User.deleteMany({}),
			Category.deleteMany({}),
			Content.deleteMany({}),
			Product.deleteMany({}),
			Review.deleteMany({}),
			Order.deleteMany({}),
			Coupon.deleteMany({}),
		]);
		console.log("✅ Existing data cleared\n");

		// Hash password directly
		const hashedPassword = await bcrypt.hash(UNIFIED_PASSWORD, 10);

		// Users data with hashed password
		const users = [
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
			{
				name: "Bob Customer",
				email: "bob@example.com",
				password: hashedPassword,
				phone: "+201000000011",
				role: "customer",
				isEmailVerified: true,
				wallet_balance: 1500,
				loyalty_points: 75,
				addresses: [
					{
						street: "202 Customer Blvd",
						city: "Giza",
						country: "Egypt",
						zip: "12511",
					},
				],
			},
			{
				name: "Sarah Seller",
				email: "sarah@example.com",
				password: hashedPassword,
				phone: "+201000000003",
				role: "seller",
				isEmailVerified: true,
				wallet_balance: 8000,
				seller_profile: {
					store_name: "Sarah's Fashion",
					bio: "Trendy fashion for everyone",
					approval_status: "approved",
				},
				addresses: [
					{
						street: "789 Fashion St",
						city: "Cairo",
						country: "Egypt",
						zip: "11511",
					},
				],
			},
		];

		// Seed Users
		console.log("👥 Seeding users...");
		const createdUsers = await User.insertMany(users);
		const seller1 = createdUsers.find((u) => u.email === "seller@example.com");
		const seller2 = createdUsers.find((u) => u.email === "sarah@example.com");
		const customer1 = createdUsers.find(
			(u) => u.email === "customer@example.com"
		);
		const customer2 = createdUsers.find((u) => u.email === "bob@example.com");
		console.log(`✅ Created ${createdUsers.length} users\n`);

		// Seed Categories
		console.log("📂 Seeding categories...");
		const createdCategories = await Category.insertMany(categories);
		const electronicsCat = createdCategories.find(
			(c) => c.slug === "electronics"
		);
		const clothingCat = createdCategories.find((c) => c.slug === "clothing");
		const booksCat = createdCategories.find((c) => c.slug === "books");
		const homeCat = createdCategories.find((c) => c.slug === "home-garden");
		const sportsCat = createdCategories.find((c) => c.slug === "sports");
		console.log(`✅ Created ${createdCategories.length} categories\n`);

		// Seed Content
		console.log("📝 Seeding content...");
		const createdContent = await Content.insertMany(contents);
		console.log(`✅ Created ${createdContent.length} content entries\n`);

		// Seed Products
		console.log("📦 Seeding products...");
		const productsToInsert = products.map((p, index) => {
			let seller, category;
			if (index < 4) {
				seller = seller1._id;
				category = electronicsCat._id;
			} else if (index < 8) {
				seller = seller2._id;
				category = clothingCat._id;
			} else if (index < 10) {
				seller = seller1._id;
				category = booksCat._id;
			} else if (index < 12) {
				seller = seller2._id;
				category = homeCat._id;
			} else {
				seller = seller1._id;
				category = sportsCat._id;
			}
			return { ...p, seller_id: seller, category_id: category };
		});
		const createdProducts = await Product.insertMany(productsToInsert);
		console.log(`✅ Created ${createdProducts.length} products\n`);

		// Seed Reviews
		console.log("⭐ Seeding reviews...");
		const reviewsToInsert = [];
		const usedCombinations = new Set();
		for (const product of createdProducts) {
			const reviewers = [customer1._id, customer2._id];
			const numReviews = Math.min(2, reviewers.length);
			for (let i = 0; i < numReviews; i++) {
				const reviewer = reviewers[i];
				const comboKey = `${product._id}-${reviewer}`;
				if (!usedCombinations.has(comboKey)) {
					usedCombinations.add(comboKey);
					const reviewData =
						reviews[Math.floor(Math.random() * reviews.length)];
					reviewsToInsert.push({
						product_id: product._id,
						user_id: reviewer,
						rating: reviewData.rating,
						comment: reviewData.comment,
					});
				}
			}
		}
		const createdReviews = await Review.insertMany(reviewsToInsert);
		console.log(`✅ Created ${createdReviews.length} reviews\n`);

		// Seed Coupons
		console.log("🎟️  Seeding coupons...");
		const createdCoupons = await Coupon.insertMany(coupons);
		console.log(`✅ Created ${createdCoupons.length} coupons\n`);

		// Seed Orders
		console.log("🛒 Seeding orders...");
		const orders = [
			{
				user: customer1._id,
				subtotal_amount: 45_000 + 350 + 450,
				discount_amount: 0,
				shipping_amount: 150,
				tax_amount: 4500 + 35 + 45,
				total_amount: 49_940,
				status: "delivered",
				status_timeline: [
					{ status: "pending", changed_at: new Date("2026-01-15") },
					{ status: "paid", changed_at: new Date("2026-01-15") },
					{ status: "shipped", changed_at: new Date("2026-01-16") },
					{ status: "delivered", changed_at: new Date("2026-01-18") },
				],
				shipping_address: {
					street: "101 Customer Lane",
					city: "Cairo",
					country: "Egypt",
					zip: "11511",
				},
				items: [
					{
						product: createdProducts[0]._id,
						seller_id: seller1._id,
						title: createdProducts[0].title,
						price: 45_000,
						quantity: 1,
					},
					{
						product: createdProducts[8]._id,
						seller_id: seller1._id,
						title: createdProducts[8].title,
						price: 350,
						quantity: 1,
					},
					{
						product: createdProducts[12]._id,
						seller_id: seller1._id,
						title: createdProducts[12].title,
						price: 450,
						quantity: 1,
					},
				],
				payment_info: { status: "paid", method: "card" },
			},
			{
				user: customer2._id,
				subtotal_amount: 450 + 1200 + 800,
				discount_amount: 245,
				shipping_amount: 100,
				tax_amount: 45 + 120 + 80,
				total_amount: 1300,
				status: "shipped",
				status_timeline: [
					{ status: "pending", changed_at: new Date("2026-02-10") },
					{ status: "paid", changed_at: new Date("2026-02-10") },
					{ status: "shipped", changed_at: new Date("2026-02-11") },
				],
				shipping_address: {
					street: "202 Customer Blvd",
					city: "Giza",
					country: "Egypt",
					zip: "12511",
				},
				items: [
					{
						product: createdProducts[4]._id,
						seller_id: seller2._id,
						title: createdProducts[4].title,
						price: 450,
						quantity: 1,
					},
					{
						product: createdProducts[5]._id,
						seller_id: seller2._id,
						title: createdProducts[5].title,
						price: 1200,
						quantity: 1,
					},
					{
						product: createdProducts[10]._id,
						seller_id: seller2._id,
						title: createdProducts[10].title,
						price: 800,
						quantity: 1,
					},
				],
				payment_info: { status: "paid", method: "wallet" },
			},
			{
				user: customer1._id,
				subtotal_amount: 380,
				discount_amount: 0,
				shipping_amount: 50,
				tax_amount: 38,
				total_amount: 468,
				status: "pending",
				status_timeline: [
					{ status: "pending", changed_at: new Date("2026-02-20") },
				],
				shipping_address: {
					street: "101 Customer Lane",
					city: "Cairo",
					country: "Egypt",
					zip: "11511",
				},
				items: [
					{
						product: createdProducts[13]._id,
						seller_id: seller1._id,
						title: createdProducts[13].title,
						price: 380,
						quantity: 1,
					},
				],
				payment_info: { status: "pending", method: "card" },
			},
		];
		const createdOrders = await Order.insertMany(orders);
		console.log(`✅ Created ${createdOrders.length} orders\n`);

		// ============== SUMMARY ==============
		console.log("=".repeat(50));
		console.log("🎉 SEEDING COMPLETED SUCCESSFULLY!");
		console.log("=".repeat(50));
		console.log("\n📊 Summary:");
		console.log(`   - Users: ${createdUsers.length}`);
		console.log(`   - Categories: ${createdCategories.length}`);
		console.log(`   - Content: ${createdContent.length}`);
		console.log(`   - Products: ${createdProducts.length}`);
		console.log(`   - Reviews: ${createdReviews.length}`);
		console.log(`   - Coupons: ${createdCoupons.length}`);
		console.log(`   - Orders: ${createdOrders.length}`);

		console.log("\n👤 Test Credentials (same password: Password@123):");
		console.log("   - Admin: admin@example.com");
		console.log("   - Seller 1: seller@example.com");
		console.log("   - Seller 2: sarah@example.com");
		console.log("   - Customer 1: customer@example.com");
		console.log("   - Customer 2: bob@example.com");

		console.log("\n🎟️  Available Coupons:");
		for (const c of coupons) {
			const value = c.type === "percentage" ? `${c.value}%` : `EGP ${c.value}`;
			console.log(`   - ${c.code}: ${c.description} (${value})`);
		}

		await mongoose.disconnect();
		console.log("\n🔌 Disconnected from MongoDB");
		process.exit(0);
	} catch (error) {
		console.error("❌ Error seeding data:", error);
		process.exit(1);
	}
}

seedAll();
