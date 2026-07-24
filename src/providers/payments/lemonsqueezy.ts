import { createHmac, timingSafeEqual } from "node:crypto";
import type { CreateCheckoutInput, CreateCheckoutResult, PaymentProvider, PaymentStatusResult, RefundInput, RefundResult, VerifiedPaymentEvent } from "./base";

type LemonResponse = { data?: { id?: string; type?: string; attributes?: Record<string, unknown>; relationships?: Record<string, unknown> } };

export class LemonSqueezyPaymentProvider implements PaymentProvider {
  readonly name = "lemonsqueezy";
  private readonly baseUrl = "https://api.lemonsqueezy.com/v1";

  private async api(path: string, init: RequestInit = {}) {
    const apiKey = process.env.LEMONSQUEEZY_API_KEY?.trim();
    if (!apiKey) throw new Error("LEMONSQUEEZY_API_KEY is not configured");
    const response = await fetch(`${this.baseUrl}${path}`, {
      ...init,
      headers: {
        Accept: "application/vnd.api+json",
        "Content-Type": "application/vnd.api+json",
        Authorization: `Bearer ${apiKey}`,
        ...(init.headers || {})
      },
      cache: "no-store"
    });
    const text = await response.text();
    const body = text ? JSON.parse(text) as LemonResponse : {};
    if (!response.ok) throw new Error(`Lemon Squeezy API failed (${response.status}): ${text}`);
    return body;
  }

  async createCheckout(input: CreateCheckoutInput): Promise<CreateCheckoutResult> {
    if (input.currency.toUpperCase() !== "USD") throw new Error("Lemon Squeezy checkout requires USD");
    const storeId = process.env.LEMONSQUEEZY_STORE_ID?.trim();
    const variantId = String(input.metadata?.lemonSqueezyVariantId || process.env.LEMONSQUEEZY_VARIANT_ID || "").trim();
    if (!storeId || !variantId) throw new Error("Lemon Squeezy store/variant is not configured");
    const body = await this.api("/checkouts", {
      method: "POST",
      body: JSON.stringify({
        data: {
          type: "checkouts",
          attributes: {
            checkout_data: {
              email: input.customerEmail,
              custom: { orderNumber: input.orderNumber, orderId: input.orderId, ...(input.metadata || {}) }
            },
            product_options: { redirect_url: input.returnUrl, receipt_button_text: "Go to license" }
          },
          relationships: {
            store: { data: { type: "stores", id: storeId } },
            variant: { data: { type: "variants", id: variantId } }
          }
        }
      })
    });
    const data = body.data;
    const checkoutUrl = String(data?.attributes?.url || "");
    if (!data?.id || !checkoutUrl) throw new Error("Lemon Squeezy response did not contain checkout URL");
    return { checkoutUrl, providerCheckoutId: data.id, providerPaymentId: data.id };
  }

  async verifyWebhook(request: Request): Promise<VerifiedPaymentEvent> {
    const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET?.trim();
    if (!secret) throw new Error("LEMONSQUEEZY_WEBHOOK_SECRET is not configured");
    const rawPayload = await request.clone().text();
    const signature = request.headers.get("x-signature") || "";
    const expected = createHmac("sha256", secret).update(rawPayload).digest("hex");
    const actual = Buffer.from(signature, "hex");
    const expectedBuffer = Buffer.from(expected, "hex");
    if (actual.length !== expectedBuffer.length || !timingSafeEqual(actual, expectedBuffer)) throw new Error("Invalid Lemon Squeezy signature");
    const payload = JSON.parse(rawPayload) as { meta?: { event_name?: string; custom_data?: Record<string, unknown> }; data?: { id?: string; attributes?: Record<string, unknown> } };
    const attributes = payload.data?.attributes || {};
    const amount = Number(attributes.total ?? attributes.subtotal ?? 0);
    const currency = String(attributes.currency ?? "USD").toUpperCase();
    return {
      providerEventId: String(payload.data?.id || crypto.randomUUID()),
      eventType: String(payload.meta?.event_name || ""),
      providerPaymentId: String(payload.data?.id || ""),
      amountMinor: Number.isFinite(amount) ? Math.round(amount) : 0,
      currency,
      rawPayload
    };
  }

  async getPaymentStatus(providerPaymentId: string): Promise<PaymentStatusResult> {
    const body = await this.api(`/orders/${encodeURIComponent(providerPaymentId)}`);
    const status = String(body.data?.attributes?.status || "").toLowerCase();
    return { providerPaymentId, status: status === "paid" ? "paid" : ["refunded", "void"].includes(status) ? "refunded" : "pending" };
  }

  async refund(_input: RefundInput): Promise<RefundResult> {
    throw new Error("Lemon Squeezy refunds should be handled in the Lemon Squeezy dashboard");
  }
}
