import { beforeEach, describe, expect, it, vi } from "vitest";
import { buildIntegrationSignature, createCheckoutViaIntegration } from "@/modules/integration-api/service";
import { createOrder, updateOrder } from "@/modules/orders/service";
import { getLicensePlanByCode } from "@/modules/license-plans/service";
import { POST as payosWebhookPost } from "@/app/api/payments/payos/webhook/route";
import { PayOSPaymentProvider } from "@/providers/payments/payos";
import { resolveCheckoutPlanCode } from "@/modules/license-bridge/service";
import * as webhookService from "@/modules/webhooks/service";
import * as licenseBridgeService from "@/modules/license-bridge/service";

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

  it("sends bot callbacks to a full license-delivery endpoint without duplicating the path", async () => {
    const previousAppUrl = process.env.NEXT_PUBLIC_APP_URL;
    const previousSecret = process.env.APP_HMAC_SECRET;
    const previousWebhookSecret = process.env.BOT_WEB_HMAC_SECRET;
    const previousBotCallbackUrl = process.env.BOT_LICENSE_CALLBACK_URL;
    process.env.NEXT_PUBLIC_APP_URL = "https://hangcu.vercel.app";
    process.env.APP_HMAC_SECRET = "test-secret";
    process.env.BOT_WEB_HMAC_SECRET = "test-secret";
    process.env.BOT_LICENSE_CALLBACK_URL = "https://bot.example/license-delivery";

    const originalFetch = global.fetch;
    const botCalls: Array<{ url: string; body: unknown }> = [];

    vi.spyOn(PayOSPaymentProvider.prototype, "verifyWebhook").mockImplementation(async (request: Request) => {
      const rawPayload = await request.text();
      const parsed = JSON.parse(rawPayload) as { orderCode?: string | number };
      const orderCode = String(parsed.orderCode ?? "");
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

      if (url === "https://bot.example/license-delivery") {
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
      const order = await createOrder({
        customerEmail: "buyer@example.com",
        currency: "VND",
        source: "bot_checkout",
        notes: null,
        metadata: {
          source: "prive_bot",
          integrationSource: "bot_checkout",
          orderNumber: "ORD-END2END-2",
          planCode: "HCV_30D",
          planName: "VIP 30 Ngày - Prime",
          amountLabel: "59.000đ",
          amountMinor: 59000,
          currency: "VND",
          customerRef: "customer-1",
          checkoutId: "checkout_2"
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
          payosOrderCode: "700000002"
        }
      });

      const response = await payosWebhookPost(
        new Request("https://hangcu.vercel.app/api/payments/payos/webhook", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            orderCode: "700000002",
            data: {
              orderCode: "700000002",
              amount: 59000,
              currency: "VND"
            }
          })
        })
      );

      expect(response.status).toBe(200);
      expect(botCalls).toHaveLength(1);
      expect(botCalls[0]?.url).toBe("https://bot.example/license-delivery");
    } finally {
      global.fetch = originalFetch;
      process.env.NEXT_PUBLIC_APP_URL = previousAppUrl;
      process.env.APP_HMAC_SECRET = previousSecret;
      process.env.BOT_WEB_HMAC_SECRET = previousWebhookSecret;
      process.env.BOT_LICENSE_CALLBACK_URL = previousBotCallbackUrl;
    }
  });

  it("skips duplicate payos webhook events after the first processed delivery", async () => {
    const previousAppUrl = process.env.NEXT_PUBLIC_APP_URL;
    const previousSecret = process.env.APP_HMAC_SECRET;
    process.env.NEXT_PUBLIC_APP_URL = "https://hangcu.vercel.app";
    process.env.APP_HMAC_SECRET = "test-secret";

    const getWebhookSpy = vi.spyOn(webhookService, "getWebhookEvent").mockResolvedValue({
      id: "evt_existing",
      provider: "payos",
      providerEventId: "evt_700000001",
      eventType: "paymentLink.paid",
      payload: { orderCode: "700000001" },
      signatureValid: true,
      processingStatus: "processed",
      errorMessage: null,
      processedAt: new Date()
    });
    const issueSpy = vi.spyOn(licenseBridgeService, "issueLicenseFromPaidOrder");
    const recordSpy = vi.spyOn(webhookService, "recordWebhookEvent");
    vi.spyOn(PayOSPaymentProvider.prototype, "verifyWebhook").mockResolvedValue({
      providerEventId: "evt_700000001",
      eventType: "paymentLink.paid",
      providerPaymentId: "700000001",
      amountMinor: 59000,
      currency: "VND",
      rawPayload: JSON.stringify({
        orderCode: "700000001",
        data: { orderCode: "700000001", amount: 59000, currency: "VND" }
      })
    });

    try {
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
      expect(await response.json()).toEqual({ success: true, duplicate: true });
      expect(recordSpy).not.toHaveBeenCalled();
      expect(issueSpy).not.toHaveBeenCalled();
      expect(getWebhookSpy).toHaveBeenCalled();
    } finally {
      process.env.NEXT_PUBLIC_APP_URL = previousAppUrl;
      process.env.APP_HMAC_SECRET = previousSecret;
      vi.restoreAllMocks();
    }
  });

  it("returns 200 for webhook validation probes even when PayOS cannot verify the payload", async () => {
    const previousAppUrl = process.env.NEXT_PUBLIC_APP_URL;
    process.env.NEXT_PUBLIC_APP_URL = "https://hangcu.vercel.app";

    vi.spyOn(PayOSPaymentProvider.prototype, "verifyWebhook").mockRejectedValue(new Error("Invalid PayOS signature"));

    try {
      const response = await payosWebhookPost(
        new Request("https://hangcu.vercel.app/api/payments/payos/webhook", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ ping: true })
        })
      );

      expect(response.status).toBe(200);
      await expect(response.json()).resolves.toEqual({ success: true, ignored: true });
    } finally {
      process.env.NEXT_PUBLIC_APP_URL = previousAppUrl;
      vi.restoreAllMocks();
    }
  });

  it("logs a compact order snapshot for webhook processing", async () => {
    const previousAppUrl = process.env.NEXT_PUBLIC_APP_URL;
    const previousSecret = process.env.APP_HMAC_SECRET;
    process.env.NEXT_PUBLIC_APP_URL = "https://hangcu.vercel.app";
    process.env.APP_HMAC_SECRET = "test-secret";

    const infoSpy = vi.spyOn(console, "info").mockImplementation(() => undefined);
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);

    const getWebhookSpy = vi.spyOn(webhookService, "getWebhookEvent").mockResolvedValue(null);
    const recordSpy = vi.spyOn(webhookService, "recordWebhookEvent").mockResolvedValue({
      id: "550e8400-e29b-41d4-a716-446655440000",
      provider: "payos",
      providerEventId: "8f4769b1a527495ea1c06c59c60c70fc",
      eventType: "paymentLink.paid",
      payload: { orderCode: "784863217249488" },
      signatureValid: true,
      processingStatus: "processed",
      errorMessage: null,
      processedAt: new Date()
    });
    const issueSpy = vi.spyOn(licenseBridgeService, "issueLicenseFromPaidOrder").mockResolvedValue(null);
    vi.spyOn(PayOSPaymentProvider.prototype, "verifyWebhook").mockResolvedValue({
      providerEventId: "8f4769b1a527495ea1c06c59c60c70fc",
      eventType: "paymentLink.paid",
      providerPaymentId: "784863217249488",
      amountMinor: 59000,
      currency: "VND",
      rawPayload: JSON.stringify({
        orderCode: "784863217249488",
        data: {
          orderCode: "784863217249488",
          paymentLinkId: "8f4769b1a527495ea1c06c59c60c70fc",
          amount: 59000,
          currency: "VND"
        }
      })
    });

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
        orderNumber: "ORD-LOG01",
        planCode: "HCV_30D",
        requestedPlanCode: "HCV_30D",
        checkoutKind: "bot",
        paymentSessionId: "ps_ORDER_LOG01_123",
        paymentProvider: "payos",
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

    const orderNumber = order.orderNumber;

    await updateOrder(orderNumber, {
      metadata: {
        ...order.metadata,
        payosOrderCode: "784863217249488"
      }
    });

    try {
      const response = await payosWebhookPost(
        new Request("https://hangcu.vercel.app/api/payments/payos/webhook", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            orderCode: "784863217249488",
            data: {
              orderCode: "784863217249488",
              paymentLinkId: "8f4769b1a527495ea1c06c59c60c70fc",
              amount: 59000,
              currency: "VND"
            }
          })
        })
      );

      expect(response.status).toBe(200);
      expect(getWebhookSpy).toHaveBeenCalled();
      expect(recordSpy).toHaveBeenCalled();
      expect(issueSpy).toHaveBeenCalledWith(orderNumber);

      const snapshotLine = infoSpy.mock.calls
        .map((call) => String(call[0] ?? ""))
        .find((line) => line.startsWith("[payos-webhook] order_snapshot "));
      expect(snapshotLine).toContain(`orderNumber=${orderNumber}`);
      expect(snapshotLine).toContain("orderId=");
      expect(snapshotLine).toContain("requestedPlanCode=HCV_30D");
      const fieldOrder = [
        "planCode=HCV_30D",
        "checkoutKind=bot",
        "paymentSessionId=ps_ORDER_LOG01_123",
        "paymentProvider=payos",
        "locale=n/a",
        "currency=VND",
        "source=prive_bot",
        "integrationSource=bot_checkout"
      ];
      let lastIndex = -1;
      for (const field of fieldOrder) {
        const index = snapshotLine.indexOf(field);
        expect(index).toBeGreaterThan(lastIndex);
        lastIndex = index;
      }
      expect(snapshotLine).toContain("orderAmount=59000");
    } finally {
      process.env.NEXT_PUBLIC_APP_URL = previousAppUrl;
      process.env.APP_HMAC_SECRET = previousSecret;
      vi.restoreAllMocks();
      infoSpy.mockRestore();
      errorSpy.mockRestore();
    }
  });
});
