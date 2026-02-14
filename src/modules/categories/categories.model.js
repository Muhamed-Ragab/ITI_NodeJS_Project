import { Schema, model } from "mongoose";

const categorySchema = new Schema(
    {
        name: {
            type: String,
            required: [true, "Category name is required"],
            unique: true,
            minlength: [3, "Category name must be at least 3 characters"],
            maxlength: [32, "Category name must be less than 32 characters"],
            trim: true
        },

        slug: {
            type: String,
            lowercase: true,
            unique: true
        },

        image: {
            type: String,
            default: null
        }
    },
    {
        timestamps: true
    }
);


const CategoryModel = model("Category", categorySchema);

export default CategoryModel;
