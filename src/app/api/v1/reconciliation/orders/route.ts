import { z } from "zod";
import { createOrder, getOrderByMetadataKey, updateOrder } from "@/modules/orders/service";
import { getIntegrationSecret, verifyIntegrationRequest } from "@/modules/integration-api/service";

const evidenceSchema = z.object({
  timestamp: z.number().int(),
  nonce: z.string().min(8),
  signature: z.string().min(1),
  orderNumber: z.string().min(1),
  botOrderId: z.string().min(1),
  paymentProvider: z.literal("PAYPAL"),
  paypalOrderId: z.string().min(1),
  paypalCaptureId: z.string().optional().default(""),
  paypalPayerId: z.string().optional().default(""),
  // The bot may not have a payer email for a Telegram-native checkout.
  payerEmail: z.union([z.string().email(), z.literal("")]).optional(),
  amountMinor: z.number().int().positive(),
  currency: z.literal("USD"),
  productType: z.literal("support").default("support"),
  productName: z.string().min(1).default("Support package"),
  paymentStatus: z.enum(["paid", "pending", "failed"]),
  telegramUserId: z.string().optional().default(""),
  internalPlanCode: z.string().optional().default(""),
  licenseCode: z.string().optional().default(""),
  licenseStatus: z.string().optional().default(""),
  fulfilledAt: z.string().datetime().optional(),
  fulfillmentType: z.string().optional().default("telegram_delivery"),
  deliveryEvidence: z.record(z.string(), z.unknown()).optional().default({})
});

export async function POST(request: Request) {
  const rawBody = await request.text();
  let body: unknown;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return Response.json({ success: false, error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = evidenceSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ success: false, error: "Invalid reconciliation payload", issues: parsed.error.issues }, { status: 400 });
  }
  const input = parsed.data;
  try {
    const unsignedBody = { ...(body as Record<string, unknown>) };
    delete unsignedBody.signature;
    verifyIntegrationRequest({
      timestamp: input.timestamp,
      nonce: input.nonce,
      signature: input.signature,
      rawBody: JSON.stringify(unsignedBody),
      rateLimitKey: `reconciliation:${input.botOrderId}`
    });
  } catch (error) {
    return Response.json({ success: false, error: "Invalid signature" }, { status: 401 });
  }

  const metadata = {
    reconciliationVersion: 1,
    internalSource: "telegram_bot",
    botOrderId: input.botOrderId,
    telegramUserId: input.telegramUserId,
    internalPlanCode: input.internalPlanCode,
    paypalOrderId: input.paypalOrderId,
    paypalCaptureId: input.paypalCaptureId,
    paypalPayerId: input.paypalPayerId,
    payerEmail: input.payerEmail ?? "",
    productType: "support",
    paymentStatus: input.paymentStatus,
    licenseCode: input.licenseCode,
    licenseStatus: input.licenseStatus,
    fulfillmentType: input.fulfillmentType,
    fulfilledAt: input.fulfilledAt ?? null,
    deliveryEvidence: input.deliveryEvidence,
    sourcePayload: "prive_bot"
  };
  const existing = await getOrderByMetadataKey("botOrderId", input.botOrderId);
  const order = existing ?? await createOrder({
    customerEmail: input.payerEmail ?? `paypal-${input.botOrderId}@hangcu.local`,
    currency: "USD",
    source: "bot_support_reconciliation",
    notes: `PayPal reconciliation for ${input.botOrderId}`,
    metadata,
    items: [{
      productId: "SUPPORT_TELEGRAM",
      sku: "SUPPORT_TELEGRAM",
      productName: input.productName,
      quantity: 1,
      unitAmountMinor: input.amountMinor,
      totalAmountMinor: input.amountMinor,
      productSnapshot: { type: "support", source: "telegram_bot" }
    }]
  });
  const updated = await updateOrder(order.orderNumber, {
    customerEmail: input.payerEmail || order.customerEmail,
    status: input.paymentStatus === "paid" ? "paid" : input.paymentStatus === "failed" ? "failed" : "pending",
    paymentStatus: input.paymentStatus === "paid" ? "paid" : input.paymentStatus === "failed" ? "failed" : "pending",
    fulfillmentStatus: input.paymentStatus === "paid" && input.licenseCode ? "fulfilled" : "unfulfilled",
    paymentProvider: "paypal",
    providerCheckoutId: input.paypalOrderId,
    providerOrderId: input.paypalOrderId,
    providerPaymentId: input.paypalCaptureId || null,
    fulfillmentMethod: input.fulfillmentType,
    deliveredAt: input.fulfilledAt ?? null,
    paymentRecordedAt: input.paymentStatus === "paid" ? new Date().toISOString() : order.paymentRecordedAt,
    metadata: { ...order.metadata, ...metadata, updatedAt: new Date().toISOString() }
  });
  return Response.json({ success: true, orderNumber: updated?.orderNumber ?? order.orderNumber, duplicate: Boolean(existing) });
}

export async function GET() {
  return Response.json({ success: true, endpoint: "paypal-reconciliation", secret: getIntegrationSecret() ? "configured" : "missing" });
}
