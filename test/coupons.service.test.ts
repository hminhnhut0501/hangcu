import { describe, expect, it } from "vitest";
import { validateCoupon } from "@/modules/coupons/service";

describe("coupons service", () => {
  it("calculates percentage discounts", async () => {
    const result = await validateCoupon({
      code: "WELCOME10",
      subtotalMinor: 10000,
      currency: "USD"
    });

    expect(result.discountMinor).toBe(1000);
    expect(result.valid).toBe(true);
  });
});
