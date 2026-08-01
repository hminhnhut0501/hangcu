import { Creem } from "creem";
import { constructWebhookEventEntity } from "creem/webhooks";
import { getCreemConfig, resolveCreemProductIdFromConfig } from "@/modules/creem-config/service";
import type {
  CreateCheckoutInput,
  CreateCheckoutResult,
  PaymentProvider,
  PaymentStatusResult,
  RefundInput,
  RefundResult,
  VerifiedPaymentEvent
} from "./base";

type CreemCheckoutEvent = {
  id?: string;
  eventType?: string;
  created_at?: number;
  object?: {
    id?: string;
    request_id?: string;
    order?: {
      id?: string;
      amount?: number;
      currency?: string;
      status?: string;
      customer?: string;
      product?: string;
    };
    customer?: {
      id?: string;
      email?: string;
    };
    product?: {
      id?: string;
    };
  };
};

const CREEM_PRODUCT_ID_ENV_MAP: Record<string, string> = {
  FULL_1M: "CREEM_PRODUCT_ID_FULL_1M",
  FULL_LIFE: "CREEM_PRODUCT_ID_FULL_LIFE",
  SUPPORT_30: "CREEM_PRODUCT_ID_SUPPORT_30",
  SUPPORT_PLUS: "CREEM_PRODUCT_ID_SUPPORT_PLUS",
  SUPPORT_LIFE: "CREEM_PRODUCT_ID_SUPPORT_LIFE"
};

async function getCreemClient() {
  const config = await getCreemConfig();
  const apiKey = config.apiKey;
  if (!apiKey) {
    throw new Error("Creem is not configured");
  }
  return new Creem({
    apiKey,
    server: config.server,
    debugLogger: process.env.CREEM_DEBUG === "true" ? console : undefined
  });
}

export async function getCreemProductPricing(productId: string) {
  const creem = await getCreemClient();
  const product = await creem.products.get(productId);
  return { productId: product.id, amountMinor: product.price, currency: product.currency.toUpperCase() };
}

export function resolveCreemProductId(planCode?: string | null) {
  const normalized = String(planCode ?? "").trim().toUpperCase();
  if (!normalized) {
    return "";
  }
  const envKey = CREEM_PRODUCT_ID_ENV_MAP[normalized];
  if (envKey) {
    return process.env[envKey]?.trim() ?? "";
  }
  return process.env.CREEM_PRODUCT_ID_DEFAULT?.trim() ?? "";
}

export class CreemPaymentProvider implements PaymentProvider {
  readonly name = "creem";

  async createCheckout(input: CreateCheckoutInput): Promise<CreateCheckoutResult> {
    if (input.currency.toUpperCase() !== "USD") {
      throw new Error("Creem checkout requires USD");
    }

    const planCode = String(input.metadata?.planCode ?? input.metadata?.requestedPlanCode ?? "").trim();
    const productId = String(input.metadata?.creemProductId ?? await resolveCreemProductIdFromConfig(planCode)).trim();
    if (!productId) {
      throw new Error(
        `Creem product id is not configured for ${planCode || input.orderNumber}. Set CREEM_PRODUCT_ID_${planCode || "DEFAULT"} in environment.`
      );
    }

    const creem = await getCreemClient();
    const checkout = await creem.checkouts.create({
      productId,
      requestId: input.orderNumber,
      successUrl: input.returnUrl,
      metadata: {
        orderId: input.orderId,
        orderNumber: input.orderNumber,
        customerEmail: input.customerEmail ?? "",
        ...input.metadata
      }
    });

    return {
      checkoutUrl: checkout.checkoutUrl ?? "",
      providerCheckoutId: checkout.id,
      providerPaymentId: checkout.order && typeof checkout.order !== "string" ? checkout.order.id ?? checkout.id : checkout.id
    };
  }

  async verifyWebhook(request: Request): Promise<VerifiedPaymentEvent> {
    const secret = (await getCreemConfig()).webhookSecret;
    if (!secret) {
      throw new Error("CREEM_WEBHOOK_SECRET is not configured");
    }

    const rawPayload = await request.clone().text();
    const event = await constructWebhookEventEntity(rawPayload, request.headers, { secret });
    const typedEvent = event as unknown as CreemCheckoutEvent;
    const order = typedEvent.object?.order ?? null;

    return {
      providerEventId: typedEvent.id ?? typedEvent.object?.id ?? `creem_${Date.now()}`,
      eventType: String(typedEvent.eventType ?? "checkout.completed"),
      providerPaymentId: String(order?.id ?? typedEvent.object?.id ?? typedEvent.id ?? "unknown"),
      amountMinor: Number(order?.amount ?? 0),
      currency: String(order?.currency ?? "USD").toUpperCase(),
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
    throw new Error("Creem refunds are handled in the Creem dashboard");
  }
}
