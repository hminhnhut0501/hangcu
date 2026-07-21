import { z } from "zod";

export const productLicenseRuleSchema = z.object({
  id: z.string(),
  productId: z.string(),
  licensePlanId: z.string(),
  quantity: z.number().int().positive(),
  isActive: z.boolean(),
  startsAt: z.date().nullable(),
  endsAt: z.date().nullable()
});

export type ProductLicenseRule = z.infer<typeof productLicenseRuleSchema>;
