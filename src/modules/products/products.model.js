import { model, Schema } from "mongoose";

const productSchema = new Schema(
	{
		seller_id: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: [true, "Seller ID is required"],
		},

		category_id: {
			type: Schema.Types.ObjectId,
			ref: "Category",
			required: [true, "Category ID is required"],
		},

		title: {
			type: String,
			required: [true, "Product title is required"],
			minlength: [3, "Title must be at least 3 characters"],
			maxlength: [100, "Title must be less than 100 characters"],
			trim: true,
		},

		description: {
			type: String,
			required: [true, "Product description is required"],
			maxlength: [2000, "Description must be less than 2000 characters"],
			trim: true,
		},

		price: {
			type: Number,
			required: [true, "Price is required"],
			min: [0, "Price cannot be negative"],
		},

		stock_quantity: {
			type: Number,
			required: [true, "Stock quantity is required"],
			min: [0, "Stock cannot be negative"],
			default: 0,
		},

		images: {
			type: [String],
			default: [],
		},

		average_rating: {
			type: Number,
			min: 0,
			max: 5,
			default: 0,
		},

		is_active: {
			type: Boolean,
			default: true,
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

const ProductModel = model("Product", productSchema);

export default ProductModel;
