import mongoose from "mongoose";
import { z } from "zod";

const objectId = z
  .string()
  .refine((value) => mongoose.Types.ObjectId.isValid(value), {
    message: "Invalid category id",
  });

export const categoryCreateSchema = z.object({
  name: z.string().trim().min(3).max(32),
  image: z.string().url().optional(),
  description: z.string().trim().max(250).optional(),
});

export const categoryUpdateSchema = z.object({
  name: z.string().trim().min(3).max(32).optional(),
  image: z.string().url().optional(),
  description: z.string().trim().max(250).optional(),
});

export const categoryIdSchema = z.object({
  id: objectId,
});

export const imageUploadSchema = z.object({
  images: z.array(z.string().url()).min(1),
});

export const imageUploadPayloadSchema = z.object({
  folder: z.string().min(1).max(150).optional(),
});
