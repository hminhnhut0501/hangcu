import type { Coupon } from "./schema";

export type CouponValidationResult = {
  valid: boolean;
  reason?: string;
  discountMinor: number;
  coupon: Coupon | null;
};
