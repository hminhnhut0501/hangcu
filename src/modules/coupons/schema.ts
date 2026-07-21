import { z } from "zod";

export const couponStatusSchema = z.enum(["active", "inactive", "archived"]);
export const couponTypeSchema = z.enum(["percent", "fixed"]);

export const couponSchema = z.object({
  id: z.string(),
  code: z.string().min(1),
  type: couponTypeSchema,
  value: z.number().nonnegative(),
  currency: z.string().nullable(),
  minOrderMinor: z.number().int().nonnegative(),
  maxRedemptions: z.number().int().positive(),
  redemptionCount: z.number().int().nonnegative(),
  startsAt: z.date().nullable(),
  endsAt: z.date().nullable(),
  status: couponStatusSchema
});

export type Coupon = z.infer<typeof couponSchema>;
