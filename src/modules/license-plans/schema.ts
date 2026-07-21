import { z } from "zod";

export const licensePlanStatusSchema = z.enum(["active", "hidden", "archived"]);
export const licensePlanTypeSchema = z.enum(["regular", "donate_bonus", "special"]);

export const licensePlanSchema = z.object({
  id: z.string(),
  code: z.string().min(1),
  name: z.string().min(1),
  nameVi: z.string().min(1),
  nameEn: z.string().min(1),
  slug: z.string().min(1),
  description: z.string(),
  currencyPrices: z.object({
    VND: z.number().nullable(),
    USD: z.number().nullable()
  }),
  planType: licensePlanTypeSchema,
  durationDays: z.number().int().nonnegative(),
  isLifetime: z.boolean(),
  status: licensePlanStatusSchema,
  sortOrder: z.number().int().nonnegative(),
  entitlementTags: z.array(z.string()),
  metadata: z.record(z.string(), z.unknown())
});

export type LicensePlan = z.infer<typeof licensePlanSchema>;
