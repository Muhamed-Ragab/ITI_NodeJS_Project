import { model, Schema } from "mongoose";

const reviewSchema = new Schema(
	{
		product_id: {
			type: Schema.Types.ObjectId,
			ref: "Product",
			required: [true, "Product ID is required"],
		},
		user_id: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: [true, "User ID is required"],
		},
		rating: {
			type: Number,
			required: [true, "Rating is required"],
			min: [1, "Rating must be at least 1"],
			max: [5, "Rating must be at most 5"],
		},
		comment: {
			type: String,
			trim: true,
			maxlength: [1000, "Comment must be less than 1000 characters"],
			default: "",
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

reviewSchema.index(
	{ product_id: 1, user_id: 1, deletedAt: 1 },
	{ unique: true }
);

const ReviewModel = model("Review", reviewSchema);

export default ReviewModel;
