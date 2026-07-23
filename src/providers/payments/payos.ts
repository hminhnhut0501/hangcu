import { generateRandomToken, hmacSha256 } from "@/lib/crypto/hash";
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

function toPayosOrderCode() {
  const base = Date.now() % 1_000_000_000_000;
  const randomPart = Number(generateRandomToken(3).replace(/\D/g, "").padEnd(3, "7").slice(0, 3));
  const candidate = base * 1000 + randomPart;
  return Number.isSafeInteger(candidate) && candidate > 0 ? candidate : Math.floor(Math.random() * 1_000_000_000_000_000) + 1;
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

function isValidEmail(value: string | undefined) {
  const email = (value ?? "").trim();
  if (!email) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
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
    const description = "HangCu";
    const initialOrderCode = Number(input.metadata?.payosOrderCode ?? 0) || toPayosOrderCode();
    const attemptCheckout = async (orderCode: number) => {
      const payload = {
        orderCode,
        amount: input.amountMinor,
        description,
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
            description,
            orderCode,
            returnUrl: input.returnUrl
          },
          config.checksumKey
        )
      };
      if (isValidEmail(input.customerEmail)) {
        payload.buyerEmail = input.customerEmail.trim();
      }

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

      const rawText = await response.text().catch(() => "");
      if (!response.ok || rawText) {
        console.info(
          `[payos-checkout] orderNumber=${input.orderNumber} orderId=${input.orderId} orderCode=${orderCode} status=${response.status} body=${rawText || "empty"}`
        );
      }
      const json = (rawText ? JSON.parse(rawText) : null) as
        | { code?: string; desc?: string; data?: { checkoutUrl?: string; paymentLinkId?: string } }
        | null;

      if (!response.ok || json?.code !== "00" || !json?.data?.checkoutUrl || !json?.data?.paymentLinkId) {
        return {
          ok: false as const,
          orderCode,
          code: json?.code ?? "",
          errorText: `PayOS checkout creation failed${response.status ? ` (${response.status})` : ""}${json?.desc ? `: ${json.desc}` : ""}${rawText ? ` | body: ${rawText}` : ""}`
        };
      }

      return {
        ok: true as const,
        checkoutUrl: json.data.checkoutUrl,
        providerCheckoutId: json.data.paymentLinkId,
        providerPaymentId: String(orderCode)
      };
    };

    const attempts = [initialOrderCode, toPayosOrderCode(), toPayosOrderCode()];
    const results: Array<{ ok: false; code: string; errorText: string; orderCode: string } | { ok: true; checkoutUrl: string; providerCheckoutId: string; providerPaymentId: string }> = [];
    for (const orderCode of attempts) {
      const result = await attemptCheckout(orderCode);
      results.push(result as never);
      if (result.ok) {
        return result;
      }
      if (result.code !== "231" && !result.errorText.includes("231")) {
        throw new Error(result.errorText);
      }
    }

    const last = results[results.length - 1];
    if (last && !last.ok) {
      throw new Error(last.errorText);
    }

    throw new Error("PayOS checkout creation failed");
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
