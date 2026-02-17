import { z } from "zod";

export const addressSchema = z.object({
	street: z.string().optional(),
	city: z.string().optional(),
	country: z.string().optional(),
	zip: z.string().optional(),
});

export const profileUpdateSchema = z.object({
	name: z.string().min(2).optional(),
	address: addressSchema.optional(),
});
