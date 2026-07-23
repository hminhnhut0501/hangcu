import { hmacSha256 } from "@/lib/crypto/hash";
import type {
  CreateCheckoutInput,
  CreateCheckoutResult,
  PaymentProvider,
  PaymentStatusResult,
  RefundInput,
  RefundResult,
  VerifiedPaymentEvent
} from "./base";

type PayosWebhookPayload = {
  code: string;
  desc: string;
  success: boolean;
  data: Record<string, unknown>;
  signature?: string;
};

function toOrderCode(orderId: string) {
  const hex = Buffer.from(orderId).toString("hex").slice(0, 12) || "1";
  const numeric = Number(BigInt(`0x${hex}`) % 900000000n);
  return numeric + 100000000;
}

function sortAndJoin(values: Record<string, unknown>) {
  return Object.keys(values)
    .sort()
    .map((key) => {
      const value = values[key];
      return `${key}=${value === null || value === undefined ? "" : String(value)}`;
    })
    .join("&");
}

function buildSignature(input: Record<string, unknown>, checksumKey: string) {
  return hmacSha256(checksumKey, sortAndJoin(input));
}

function normalizeBaseUrl(value: string | undefined, fallback: string) {
  const candidate = (value ?? "").trim();
  if (!candidate) return fallback;
  if (candidate.startsWith("/")) return fallback;
  try {
    return new URL(candidate).toString().replace(/\/$/, "");
  } catch {
    return fallback;
  }
}

export class PayOSPaymentProvider implements PaymentProvider {
  readonly name = "payos";

  private getConfig() {
    const clientId = process.env.PAYOS_CLIENT_ID;
    const apiKey = process.env.PAYOS_API_KEY;
    const checksumKey = process.env.PAYOS_CHECKSUM_KEY;
    const partnerCode = process.env.PAYOS_PARTNER_CODE;
    const baseUrl = normalizeBaseUrl(process.env.PAYOS_API_BASE_URL, "https://api-merchant.payos.vn");

    if (!clientId || !apiKey || !checksumKey) {
      throw new Error("PayOS is not configured");
    }

    return { clientId, apiKey, checksumKey, partnerCode, baseUrl };
  }

  async createCheckout(input: CreateCheckoutInput): Promise<CreateCheckoutResult> {
    if (input.currency !== "VND") {
      throw new Error("PayOS only supports VND in this store");
    }

    const config = this.getConfig();
    const orderCode = toOrderCode(input.orderId);
    const payload = {
      orderCode,
      amount: input.amountMinor,
      description: `Hang Cú ${input.orderNumber}`,
      buyerEmail: input.customerEmail,
      cancelUrl: input.cancelUrl,
      returnUrl: input.returnUrl,
      items: [
        {
          name: input.orderNumber,
          quantity: 1,
          price: input.amountMinor,
          unit: "VND"
        }
      ],
      signature: buildSignature(
        {
          amount: input.amountMinor,
          cancelUrl: input.cancelUrl,
          description: `Hang Cú ${input.orderNumber}`,
          orderCode,
          returnUrl: input.returnUrl
        },
        config.checksumKey
      )
    };

    const response = await fetch(new URL("/v2/payment-requests", config.baseUrl).toString(), {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-client-id": config.clientId,
        "x-api-key": config.apiKey,
        ...(config.partnerCode ? { "x-partner-code": config.partnerCode } : {})
      },
      body: JSON.stringify(payload)
    });

    const json = (await response.json().catch(() => null)) as
      | { code?: string; data?: { checkoutUrl?: string; paymentLinkId?: string } }
      | null;

    if (!response.ok || json?.code !== "00" || !json?.data?.checkoutUrl || !json?.data?.paymentLinkId) {
      throw new Error("PayOS checkout creation failed");
    }

    return {
      checkoutUrl: json.data.checkoutUrl,
      providerCheckoutId: json.data.paymentLinkId,
      providerPaymentId: String(orderCode)
    };
  }

  async verifyWebhook(request: Request): Promise<VerifiedPaymentEvent> {
    const rawPayload = await request.text();
    const parsed = JSON.parse(rawPayload) as PayosWebhookPayload;
    const config = this.getConfig();
    const expectedSignature = buildSignature(
      parsed.data ?? {},
      config.checksumKey
    );

    if (parsed.signature && parsed.signature !== expectedSignature) {
      throw new Error("Invalid PayOS signature");
    }

    return {
      providerEventId: String(parsed.data.paymentLinkId ?? parsed.data.orderCode ?? `payos_${Date.now()}`),
      eventType: String(parsed.data.code ?? parsed.data.status ?? parsed.desc ?? "payment.updated"),
      providerPaymentId: String(parsed.data.orderCode ?? parsed.data.paymentLinkId ?? "unknown"),
      amountMinor: Number(parsed.data.amount ?? 0),
      currency: String(parsed.data.currency ?? "VND"),
      rawPayload
    };
  }

  async getPaymentStatus(providerPaymentId: string): Promise<PaymentStatusResult> {
    return {
      providerPaymentId,
      status: "pending"
    };
  }

  async refund(_input: RefundInput): Promise<RefundResult> {
    throw new Error("PayOS refund is not configured");
  }
}
