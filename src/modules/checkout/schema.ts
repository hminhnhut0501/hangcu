import { z } from "zod";

export const checkoutFormSchema = z.object({
  email: z.string().email(),
  fullName: z.string().trim().min(1).max(120).optional(),
  couponCode: z.string().trim().min(1).max(40).optional(),
  notes: z.string().trim().max(500).optional()
});

export type CheckoutFormInput = z.infer<typeof checkoutFormSchema>;
