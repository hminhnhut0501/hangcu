import { z } from "zod";

export const donatePackageStatusSchema = z.enum(["active", "hidden", "archived"]);

export const donatePackageSchema = z.object({
  id: z.string(),
  code: z.string().min(1),
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string(),
  suggestedAmountMinor: z.number().int().nonnegative().nullable(),
  currency: z.string().nullable(),
  vndAmountMinor: z.number().int().nonnegative().nullable().optional(),
  usdAmountMinor: z.number().int().nonnegative().nullable().optional(),
  status: donatePackageStatusSchema,
  metadata: z.record(z.string(), z.unknown())
});

export type DonatePackage = z.infer<typeof donatePackageSchema>;
