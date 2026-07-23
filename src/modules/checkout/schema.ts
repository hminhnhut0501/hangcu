import { z } from "zod";

const optionalTrimmedString = (max: number) =>
  z
    .union([z.string().trim().min(1).max(max), z.literal("")])
    .optional()
    .transform((value) => {
      if (value == null || value === "") return undefined;
      return value;
    });

export const checkoutFormSchema = z.object({
  email: z.string().email().optional(),
  fullName: optionalTrimmedString(120),
  couponCode: optionalTrimmedString(40),
  notes: optionalTrimmedString(500)
});

export type CheckoutFormInput = z.infer<typeof checkoutFormSchema>;
