import type {
  CreateCheckoutInput,
  CreateCheckoutResult,
  PaymentProvider,
  PaymentStatusResult,
  RefundInput,
  RefundResult,
  VerifiedPaymentEvent
} from "./base";

export class PayPalPaymentProvider implements PaymentProvider {
  readonly name = "paypal";

  private get baseUrl() {
    return (process.env.PAYPAL_API_BASE_URL ||
      (process.env.PAYPAL_ENV === "live" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com")).replace(/\/$/, "");
  }

  private async accessToken() {
    const clientId = process.env.PAYPAL_CLIENT_ID?.trim();
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET?.trim();
    if (!clientId || !clientSecret) throw new Error("PayPal credentials are not configured");
    const response = await fetch(`${this.baseUrl}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json"
      },
      body: "grant_type=client_credentials",
      cache: "no-store"
    });
    if (!response.ok) throw new Error(`PayPal token failed (${response.status}): ${await response.text()}`);
    const body = (await response.json()) as { access_token?: string };
    if (!body.access_token) throw new Error("PayPal token response did not contain access_token");
    return body.access_token;
  }

  private async api(path: string, init: RequestInit = {}) {
    const token = await this.accessToken();
    const response = await fetch(`${this.baseUrl}${path}`, {
      ...init,
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", ...(init.headers || {}) },
      cache: "no-store"
    });
    const text = await response.text();
    const body = text ? JSON.parse(text) as Record<string, unknown> : {};
    if (!response.ok) throw new Error(`PayPal API failed (${response.status}): ${text}`);
    return body;
  }

  async createCheckout(input: CreateCheckoutInput): Promise<CreateCheckoutResult> {
    if (input.currency.toUpperCase() !== "USD") throw new Error("PayPal checkout requires USD");
    if (!Number.isInteger(input.amountMinor) || input.amountMinor <= 0) throw new Error("PayPal amount must be positive cents");
    const value = (input.amountMinor / 100).toFixed(2);
    const body = await this.api("/v2/checkout/orders", {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [{
          reference_id: input.orderNumber,
          invoice_id: input.orderNumber,
          custom_id: input.orderNumber,
          amount: { currency_code: "USD", value }
        }],
        application_context: {
          return_url: input.returnUrl,
          cancel_url: input.cancelUrl,
          user_action: "PAY_NOW",
          shipping_preference: "NO_SHIPPING"
        }
      })
    });
    const id = String(body.id || "");
    const links = Array.isArray(body.links) ? body.links as Array<{ rel?: string; href?: string }> : [];
    const approvalUrl = links.find((link) => link.rel === "approve")?.href;
    if (!id || !approvalUrl) throw new Error("PayPal response did not contain order id or approval URL");
    return { checkoutUrl: approvalUrl, providerCheckoutId: id, providerPaymentId: id };
  }

  async verifyWebhook(request: Request): Promise<VerifiedPaymentEvent> {
    const webhookId = process.env.PAYPAL_WEBHOOK_ID?.trim();
    if (!webhookId) throw new Error("PAYPAL_WEBHOOK_ID is not configured");
    const rawPayload = await request.clone().text();
    const payload = JSON.parse(rawPayload) as Record<string, unknown>;
    const headers = {
      "paypal-auth-algo": request.headers.get("paypal-auth-algo") || "",
      "paypal-cert-url": request.headers.get("paypal-cert-url") || "",
      "paypal-transmission-id": request.headers.get("paypal-transmission-id") || "",
      "paypal-transmission-sig": request.headers.get("paypal-transmission-sig") || "",
      "paypal-transmission-time": request.headers.get("paypal-transmission-time") || ""
    };
    if (Object.values(headers).some((value) => !value)) throw new Error("Missing PayPal webhook signature headers");
    const verification = await this.api("/v1/notifications/verify-webhook-signature", {
      method: "POST",
      body: JSON.stringify({
        auth_algo: headers["paypal-auth-algo"],
        cert_url: headers["paypal-cert-url"],
        transmission_id: headers["paypal-transmission-id"],
        transmission_sig: headers["paypal-transmission-sig"],
        transmission_time: headers["paypal-transmission-time"],
        webhook_id: webhookId,
        webhook_event: payload
      })
    });
    if (verification.verification_status !== "SUCCESS") throw new Error("PayPal webhook signature verification failed");
    const resource = (payload.resource || {}) as Record<string, unknown>;
    const amount = (resource.amount || {}) as Record<string, unknown>;
    const purchaseUnit = Array.isArray(resource.purchase_units) ? (resource.purchase_units[0] || {}) as Record<string, unknown> : {};
    const unitAmount = (purchaseUnit.amount || {}) as Record<string, unknown>;
    const rawAmount = Number(amount.value ?? unitAmount.value ?? 0);
    return {
      providerEventId: String(payload.id || headers["paypal-transmission-id"]),
      eventType: String(payload.event_type || ""),
      providerPaymentId: String(resource.id || resource.supplementary_data || ""),
      amountMinor: Number.isFinite(rawAmount) ? Math.round(rawAmount * 100) : 0,
      currency: String(amount.currency_code ?? unitAmount.currency_code ?? "USD"),
      rawPayload
    };
  }

  async getPaymentStatus(providerPaymentId: string): Promise<PaymentStatusResult> {
    const body = await this.api(`/v2/checkout/orders/${encodeURIComponent(providerPaymentId)}`);
    const status = String(body.status || "").toUpperCase();
    return { providerPaymentId, status: status === "COMPLETED" ? "paid" : ["VOIDED", "DECLINED"].includes(status) ? "failed" : "pending" };
  }

  async captureOrder(orderId: string) {
    return this.api(`/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`, {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({})
    });
  }

  async refund(input: RefundInput): Promise<RefundResult> {
    if (input.currency.toUpperCase() !== "USD") throw new Error("PayPal refund requires USD");
    const body = await this.api(`/v2/payments/captures/${encodeURIComponent(input.providerPaymentId)}/refund`, {
      method: "POST",
      body: JSON.stringify({ amount: { currency_code: "USD", value: (input.amountMinor / 100).toFixed(2) }, note_to_payer: input.reason })
    });
    return { providerRefundId: String(body.id || ""), status: String(body.status || "COMPLETED").toUpperCase() === "COMPLETED" ? "succeeded" : "pending" };
  }
}
