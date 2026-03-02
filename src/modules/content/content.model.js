import mongoose from "mongoose";

const contentSchema = new mongoose.Schema(
	{
		section: {
			type: String,
			enum: ["homepage", "banner"],
			required: true,
			index: true,
		},
		title: {
			type: String,
			required: true,
			trim: true,
			maxlength: 120,
		},
		slug: {
			type: String,
			required: true,
			trim: true,
			lowercase: true,
			maxlength: 120,
			unique: true,
		},
		body: {
			type: String,
			default: "",
			trim: true,
		},
		image_url: {
			type: String,
			default: "",
			trim: true,
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
	},
	{ timestamps: true }
);

const Content = mongoose.model("Content", contentSchema);

export default Content;
