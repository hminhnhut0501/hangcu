import { CouponInactiveError, CouponNotFoundError } from "./errors";
import { SupabaseCouponRepository } from "./repository";

const couponRepository = new SupabaseCouponRepository();

export async function listCoupons() {
  return couponRepository.list();
}

export async function validateCoupon(input: {
  code: string;
  subtotalMinor: number;
  currency: string;
}) {
  const coupon = await couponRepository.findByCode(input.code);
  if (!coupon) {
    throw new CouponNotFoundError();
  }

  if (coupon.status !== "active") {
    throw new CouponInactiveError();
  }

  let discountMinor = 0;
  if (coupon.type === "percent") {
    discountMinor = Math.floor((input.subtotalMinor * coupon.value) / 100);
  } else {
    discountMinor = Math.min(input.subtotalMinor, Math.floor(coupon.value * 100));
  }

  return {
    valid: discountMinor > 0 || coupon.value > 0,
    reason: undefined,
    discountMinor,
    coupon
  };
}

export async function redeemCoupon(code: string) {
  const coupon = await couponRepository.findByCode(code);
  if (!coupon) {
    throw new CouponNotFoundError();
  }
  return couponRepository.save({
    ...coupon,
    redemptionCount: coupon.redemptionCount + 1
  });
}

export async function changeCouponStatus(input: {
  id: string;
  status: "active" | "inactive" | "archived";
}) {
  const coupon = await couponRepository.findById(input.id);
  if (!coupon) {
    throw new CouponNotFoundError();
  }

  return couponRepository.save({
    ...coupon,
    status: input.status
  });
}

export async function upsertCoupon(input: {
  id: string;
  code: string;
  type: "percent" | "fixed";
  value: number;
  currency?: string | null;
  minOrderMinor: number;
  maxRedemptions: number;
  redemptionCount: number;
  status: "active" | "inactive" | "archived";
}) {
  return couponRepository.save({
    id: input.id,
    code: input.code,
    type: input.type,
    value: input.value,
    currency: input.currency ?? null,
    minOrderMinor: input.minOrderMinor,
    maxRedemptions: input.maxRedemptions,
    redemptionCount: input.redemptionCount,
    startsAt: null,
    endsAt: null,
    status: input.status
  });
}
