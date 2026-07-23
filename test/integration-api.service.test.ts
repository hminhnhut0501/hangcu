import { beforeEach, describe, expect, it, vi } from "vitest";
import { buildIntegrationSignature, createCheckoutViaIntegration } from "@/modules/integration-api/service";
import { createOrder, updateOrder } from "@/modules/orders/service";
import { getLicensePlanByCode } from "@/modules/license-plans/service";
import { POST as payosWebhookPost } from "@/app/api/payments/payos/webhook/route";
import { PayOSPaymentProvider } from "@/providers/payments/payos";
import { resolveCheckoutPlanCode } from "@/modules/license-bridge/service";

describe("integration api service", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

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

  it("maps bot group plan tokens to canonical checkout plan codes", () => {
    expect(resolveCheckoutPlanCode("G1:1M")).toBe("HCV_30D");
    expect(resolveCheckoutPlanCode("G4:LIFE")).toBe("HCV_LIFETIME");
    expect(resolveCheckoutPlanCode("FULL_1M")).toBe("HCV_30D");
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

  it("runs the checkout to webhook to bot callback flow end-to-end", async () => {
    const previousAppUrl = process.env.NEXT_PUBLIC_APP_URL;
    const previousSecret = process.env.APP_HMAC_SECRET;
    const previousWebhookSecret = process.env.BOT_WEB_HMAC_SECRET;
    const previousBotCallbackUrl = process.env.BOT_LICENSE_CALLBACK_URL;
    process.env.NEXT_PUBLIC_APP_URL = "https://hangcu.vercel.app";
    process.env.APP_HMAC_SECRET = "test-secret";
    process.env.BOT_WEB_HMAC_SECRET = "test-secret";
    process.env.BOT_LICENSE_CALLBACK_URL = "https://bot.example";

    const originalFetch = global.fetch;
    const botCalls: Array<{ url: string; body: unknown }> = [];
    const webhookCalls: Array<{ orderCode: string }> = [];

    vi.spyOn(PayOSPaymentProvider.prototype, "verifyWebhook").mockImplementation(async (request: Request) => {
      const rawPayload = await request.text();
      const parsed = JSON.parse(rawPayload) as { orderCode?: string | number };
      const orderCode = String(parsed.orderCode ?? "");
      webhookCalls.push({ orderCode });
      return {
        providerEventId: `evt_${orderCode}`,
        eventType: "paymentLink.paid",
        providerPaymentId: orderCode,
        amountMinor: 59000,
        currency: "VND",
        rawPayload
      };
    });

    global.fetch = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url.includes("/v2/payment-requests")) {
        const body = init?.body ? JSON.parse(String(init.body)) as { orderCode?: number } : {};
        return new Response(
          JSON.stringify({
            code: "00",
            data: {
              checkoutUrl: "https://payos.example/checkout/abc123",
              paymentLinkId: "plink_abc123",
              orderCode: body.orderCode
            }
          }),
          { status: 200, headers: { "content-type": "application/json" } }
        );
      }

      if (url.endsWith("/license-delivery")) {
        botCalls.push({
          url,
          body: init?.body ? JSON.parse(String(init.body)) : null
        });
        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { "content-type": "application/json" }
        });
      }

      return new Response("unexpected fetch", { status: 500 });
    }) as typeof fetch;

    try {
      const plan = await getLicensePlanByCode("HCV_30D");
      expect(plan).toBeTruthy();

      const order = await createOrder({
        customerEmail: "buyer@example.com",
        currency: "VND",
        source: "bot_checkout",
        notes: null,
        metadata: {
          source: "prive_bot",
          integrationSource: "bot_checkout",
          orderNumber: "ORD-END2END-1",
          planCode: "HCV_30D",
          planName: "VIP 30 Ngày - Prime",
          amountLabel: "59.000đ",
          amountMinor: 59000,
          currency: "VND",
          customerRef: "customer-1",
          checkoutId: "checkout_1"
        },
        items: [
          {
            productId: plan!.id,
            sku: plan!.code,
            productName: "VIP 30 Ngày - Prime",
            quantity: 1,
            unitAmountMinor: 59000,
            totalAmountMinor: 59000,
            productSnapshot: {
              name: "VIP 30 Ngày - Prime",
              slug: plan!.slug,
              shortDescription: plan!.description,
              status: "active",
              downloadLimit: 0,
              downloadExpiryDays: plan!.durationDays
            }
          }
        ]
      });

      await updateOrder(order.orderNumber, {
        metadata: {
          ...order.metadata,
          payosOrderCode: "700000001"
        }
      });

      const response = await payosWebhookPost(
        new Request("https://hangcu.vercel.app/api/payments/payos/webhook", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            orderCode: "700000001",
            data: {
              orderCode: "700000001",
              amount: 59000,
              currency: "VND"
            }
          })
        })
      );

      expect(response.status).toBe(200);
      expect(webhookCalls).toEqual([{ orderCode: "700000001" }]);
      expect(botCalls).toHaveLength(1);

      const botPayload = botCalls[0]?.body as {
        licenseCode?: string;
        activationUrl?: string;
        groupIds?: string[];
        planCode?: string;
      };
      expect(botPayload.planCode).toBe("HCV_30D");
      expect(botPayload.licenseCode).toMatch(/^LIC-/);
      expect(botPayload.activationUrl).toContain("t.me");
      expect(botPayload.activationUrl).toContain("start=lic_");
      expect(Array.isArray(botPayload.groupIds)).toBe(true);
    } finally {
      global.fetch = originalFetch;
      process.env.NEXT_PUBLIC_APP_URL = previousAppUrl;
      process.env.APP_HMAC_SECRET = previousSecret;
      process.env.BOT_WEB_HMAC_SECRET = previousWebhookSecret;
      process.env.BOT_LICENSE_CALLBACK_URL = previousBotCallbackUrl;
    }
  });
});
