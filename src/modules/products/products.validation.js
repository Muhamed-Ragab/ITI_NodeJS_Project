import mongoose from "mongoose";
import { z } from "zod";

const objectId = z
	.string()
	.refine((value) => mongoose.Types.ObjectId.isValid(value), {
		message: "Invalid ID format",
	});

export const productCreateSchema = z.object({
	category_id: objectId,
	title: z.string().min(3).max(100),
	description: z.string().min(10).max(2000),
	price: z.number().min(0),
	stock_quantity: z.number().int().min(0),
	images: z.array(z.string().url()).optional(),
	is_active: z.boolean().optional(),
});

export const productUpdateSchema = z.object({
	category_id: objectId.optional(),
	title: z.string().min(3).max(100).optional(),
	description: z.string().min(10).max(2000).optional(),
	price: z.number().min(0).optional(),
	stock_quantity: z.number().int().min(0).optional(),
	images: z.array(z.string().url()).optional(),
	is_active: z.boolean().optional(),
});

export const productIdSchema = z.object({
	id: objectId,
});

export const productQuerySchema = z.object({
	category_id: objectId.optional(),
	min_price: z.string().optional(),
	max_price: z.string().optional(),
	search: z.string().optional(),
	is_active: z.string().optional(),
	page: z.string().optional(),
	limit: z.string().optional(),
	min_rating: z.string().optional(),
	seller_id: objectId.optional(),
	in_stock: z.string().optional(),
	min_rating_count: z.string().optional(),
	sort: z.string().optional(),
});

export const imageUploadSchema = z.object({
	images: z.array(z.string().url()).min(1),
});

export const imageUploadPayloadSchema = z.object({
	folder: z.string().min(1).max(150).optional(),
});
