import { describe, expect, it } from "vitest";
import { buildIntegrationSignature, createCheckoutViaIntegration } from "@/modules/integration-api/service";

describe("integration api service", () => {
  it("builds hmac signatures deterministically", () => {
    const previousSecret = process.env.APP_HMAC_SECRET;
    process.env.APP_HMAC_SECRET = "test-secret";
    try {
      const signature = buildIntegrationSignature({
        timestamp: 1784600000,
        nonce: "random-string",
        rawBody: '{"code":"HC-7KM4-R2NX-P9VA"}'
      });

      expect(signature).toHaveLength(64);
    } finally {
      process.env.APP_HMAC_SECRET = previousSecret;
    }
  });

  it("creates checkout payloads with entitlement metadata", async () => {
    const previousSecret = process.env.APP_HMAC_SECRET;
    const previousAppUrl = process.env.NEXT_PUBLIC_APP_URL;
    process.env.APP_HMAC_SECRET = "test-secret";
    process.env.NEXT_PUBLIC_APP_URL = "https://hangcu.vercel.app";
    try {
      const result = await createCheckoutViaIntegration({
        timestamp: 1784600000,
        nonce: "random-string-2",
        signature: "unused-for-direct-call",
        orderId: "ORD123",
        planCode: "HCV_30D",
        locale: "vi",
        currency: "VND",
        telegramUserId: "123456789",
        customerRef: "customer-1",
        activationCode: "ACT_ABC123"
      });

      expect(result.planCode).toBe("HCV_30D");
      expect(result.locale).toBe("vi");
      expect(result.currency).toBe("VND");
      expect(result.entitlements).toContain("app_access");
      expect(result.entitlements).toContain("vip_group_access");
    } finally {
      process.env.APP_HMAC_SECRET = previousSecret;
      process.env.NEXT_PUBLIC_APP_URL = previousAppUrl;
    }
  });
});
