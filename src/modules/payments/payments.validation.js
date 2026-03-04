import mongoose from "mongoose";
import { z } from "zod";

const objectId = z
  .string()
  .refine((value) => mongoose.Types.ObjectId.isValid(value), {
    message: "Invalid ID format",
  });

export const paymentIntentSchema = z.object({
  orderId: objectId,
});

export const guestPaymentIntentSchema = z.object({
  orderId: objectId,
  guestEmail: z.string().email("Invalid email format"),
});

export const paymentCheckoutSchema = z.object({
  orderId: objectId,
  method: z.enum(["stripe", "paypal", "cod", "wallet"]),
  savedMethodId: objectId.optional(),
});

export const guestCheckoutSchema = z.object({
  orderId: objectId,
  method: z.enum(["stripe", "paypal", "cod"]),
  guestEmail: z.string().email("Invalid email format"),
  savedMethodId: objectId.optional(),
});

export const paymentsAdminQuerySchema = z.object({
  status: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});
