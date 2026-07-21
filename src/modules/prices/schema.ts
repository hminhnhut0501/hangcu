import { z } from "zod";

export const priceSchema = z.object({
  id: z.string(),
  productId: z.string(),
  currency: z.string().length(3),
  amountMinor: z.number().int().nonnegative(),
  compareAtAmountMinor: z.number().int().nonnegative().nullable(),
  isActive: z.boolean(),
  validFrom: z.date().nullable(),
  validUntil: z.date().nullable()
});

export type Price = z.infer<typeof priceSchema>;
