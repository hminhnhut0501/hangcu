import { describe, expect, it } from "vitest";
import { createPaymentCheckout } from "@/modules/payments/service";

describe("payments service", () => {
  it("creates a sandbox checkout", async () => {
    const result = await createPaymentCheckout({
      orderId: "order_1",
      orderNumber: "ORD-ABC123",
      amountMinor: 4900,
      currency: "USD",
      customerEmail: "buyer@example.com",
      provider: "sandbox",
      returnUrl: "https://example.com/success",
      cancelUrl: "https://example.com/cancel"
    });

    expect(result.checkoutUrl).toContain("sandbox=1");
  });
});
