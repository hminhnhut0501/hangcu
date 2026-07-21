export class CouponNotFoundError extends Error {
  constructor() {
    super("Coupon not found");
    this.name = "CouponNotFoundError";
  }
}

export class CouponInactiveError extends Error {
  constructor() {
    super("Coupon inactive");
    this.name = "CouponInactiveError";
  }
}
