import { constructWebhookEventEntity } from "creem/webhooks";
import { getWebhookEvent, recordWebhookEvent } from "@/modules/webhooks/service";
import { getOrderByMetadataKey, getOrderByOrderNumber, updateOrder } from "@/modules/orders/service";
import { issueLicenseFromPaidOrder } from "@/modules/license-bridge/service";
import { resolveCreemPlanConfig } from "@/modules/creem-config/service";

function getWebhookSecret() {
  const secret = process.env.CREEM_WEBHOOK_SECRET?.trim();
  if (!secret) {
    throw new Error("CREEM_WEBHOOK_SECRET is not configured");
  }
  return secret;
}

export async function POST(request: Request) {
  const rawBody = await request.clone().text().catch(() => "");
  let event;

  try {
    event = await constructWebhookEventEntity(rawBody, request.headers, { secret: getWebhookSecret() });
  } catch (error) {
    console.error(`[creem-webhook] verify_failed error=${error instanceof Error ? error.message : String(error)}`);
    return Response.json({ success: false, error: "Webhook verification failed" }, { status: 400 });
  }

  const payload = event as unknown as {
    id: string;
    eventType: string;
    object?: {
      id?: string;
      request_id?: string;
      order?: {
        id?: string;
        amount?: number;
        currency?: string;
        status?: string;
        product?: string | { id?: string };
        customer?: string;
      };
      customer?: { id?: string; email?: string };
      product?: { id?: string };
    };
  };
  const requestId = String(payload.object?.request_id ?? "");
  const checkoutId = String(payload.object?.id ?? "");
  const orderId = String(payload.object?.order?.id ?? "");
  const linkedOrder =
    (requestId ? await getOrderByOrderNumber(requestId) : null) ||
    (checkoutId ? await getOrderByMetadataKey("providerCheckoutId", checkoutId) : null) ||
    (orderId ? await getOrderByMetadataKey("providerOrderId", orderId) : null);
  const existingEvent = await getWebhookEvent("creem", payload.id);

  console.info(
    `[creem-webhook] eventId=${payload.id} eventType=${payload.eventType} requestId=${requestId || "n/a"} checkoutId=${checkoutId || "n/a"} orderId=${orderId || "n/a"} linkedOrder=${linkedOrder?.orderNumber || "none"} duplicate=${existingEvent ? "yes" : "no"}`
  );

  if (existingEvent?.processingStatus === "processed") {
    return Response.json({ success: true, duplicate: true });
  }

  if (linkedOrder && payload.eventType === "checkout.completed" && payload.object?.order?.status === "paid") {
    const metadataPlanCode = String(linkedOrder.metadata?.planCode ?? linkedOrder.items[0]?.sku ?? "");
    const expected = await resolveCreemPlanConfig(metadataPlanCode);
    const productValue = payload.object.order.product ?? payload.object.product;
    const actualProductId = typeof productValue === "string" ? productValue : String(productValue?.id ?? "");
    const actualAmountMinor = Number(payload.object.order.amount ?? 0);
    const actualCurrency = String(payload.object.order.currency ?? linkedOrder.currency ?? "").toUpperCase();
    const valid = Boolean(
      expected &&
      actualProductId && actualProductId === expected.productId &&
      actualAmountMinor === linkedOrder.totalMinor &&
      actualCurrency === "USD"
    );
    console.info(
      `[creem-webhook] payment_validation orderNumber=${linkedOrder.orderNumber} planCode=${metadataPlanCode || "n/a"} productId=${actualProductId || "n/a"} expectedProductId=${expected?.productId || "n/a"} amountMinor=${actualAmountMinor} orderAmountMinor=${linkedOrder.totalMinor} currency=${actualCurrency} valid=${valid ? "yes" : "no"}`
    );
    if (!valid) {
      await recordWebhookEvent({
        id: crypto.randomUUID(),
        provider: "creem",
        providerEventId: payload.id,
        eventType: payload.eventType,
        payload,
        signatureValid: true,
        processingStatus: "failed",
        errorMessage: "Creem product, amount, or currency did not match the fixed plan mapping.",
        processedAt: null
      });
      return Response.json({ success: false, error: "Creem payment did not match the configured plan." }, { status: 400 });
    }
  }

  await recordWebhookEvent({
    id: crypto.randomUUID(),
    provider: "creem",
    providerEventId: payload.id,
    eventType: payload.eventType,
    payload,
    signatureValid: true,
    processingStatus: "processed",
    errorMessage: null,
    processedAt: new Date()
  });

  if (linkedOrder && payload.eventType === "checkout.completed" && payload.object?.order?.status === "paid") {
    const now = new Date().toISOString();
    await updateOrder(linkedOrder.orderNumber, {
      paymentProvider: "creem",
      providerCheckoutId: checkoutId || linkedOrder.providerCheckoutId || null,
      providerOrderId: orderId || linkedOrder.providerOrderId || null,
      providerPaymentId: orderId || linkedOrder.providerPaymentId || null,
      providerEventId: payload.id,
      paymentRecordedAt: now,
      firstPaidAt: linkedOrder.firstPaidAt ?? now,
      lastPaymentEventAt: now,
      metadata: {
        ...linkedOrder.metadata,
        paymentProvider: "creem",
        providerCheckoutId: checkoutId || linkedOrder.metadata?.providerCheckoutId || null,
        providerOrderId: orderId || linkedOrder.metadata?.providerOrderId || null,
        providerPaymentId: orderId || linkedOrder.metadata?.providerPaymentId || null,
        providerEventId: payload.id,
        paymentRecordedAt: now,
        lastPaymentEventAt: now
      }
    });
    await issueLicenseFromPaidOrder(linkedOrder.orderNumber);
  }

  return Response.json({ success: true, linkedOrder: linkedOrder?.orderNumber || null });
}

export async function GET() {
  return Response.json({ success: true, health: "ok" });
}
