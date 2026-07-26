import { PayPalPaymentProvider } from "@/providers/payments/paypal";
import { getWebhookEvent, recordWebhookEvent } from "@/modules/webhooks/service";
import { getOrderByMetadataKey, getOrderByOrderNumber, updateOrder } from "@/modules/orders/service";
import { issueLicenseFromPaidOrder } from "@/modules/license-bridge/service";

const provider = new PayPalPaymentProvider();

export async function POST(request: Request) {
  let event;
  try {
    event = await provider.verifyWebhook(request);
  } catch (error) {
    console.error(`[paypal-webhook] verify_failed error=${error instanceof Error ? error.message : String(error)}`);
    return Response.json({ success: false, error: "Webhook verification failed" }, { status: 400 });
  }

  const payload = JSON.parse(event.rawPayload) as {
    resource?: {
      id?: string;
      custom_id?: string;
      invoice_id?: string;
      supplementary_data?: { related_ids?: { order_id?: string } };
    };
  };
  const resource = payload.resource || {};
  const paypalOrderId = resource.supplementary_data?.related_ids?.order_id ||
    (event.eventType.startsWith("CHECKOUT.ORDER.") ? resource.id : undefined);
  const orderNumber = resource.custom_id || resource.invoice_id;
  const linkedOrder =
    (orderNumber ? await getOrderByOrderNumber(orderNumber) : null) ||
    (paypalOrderId ? await getOrderByMetadataKey("providerCheckoutId", paypalOrderId) : null);
  const existingEvent = await getWebhookEvent("paypal", event.providerEventId);
  console.info(
    `[paypal-webhook] eventId=${event.providerEventId} eventType=${event.eventType} paypalOrderId=${paypalOrderId || "n/a"} paymentId=${event.providerPaymentId || "n/a"} linkedOrder=${linkedOrder?.orderNumber || "none"} duplicate=${existingEvent ? "yes" : "no"}`
  );

  if (existingEvent?.processingStatus === "processed") return Response.json({ success: true, duplicate: true });

  await recordWebhookEvent({
    id: crypto.randomUUID(),
    provider: "paypal",
    providerEventId: event.providerEventId,
    eventType: event.eventType,
    payload: JSON.parse(event.rawPayload),
    signatureValid: true,
    processingStatus: "processed",
    errorMessage: null,
    processedAt: new Date()
  });

  if (event.eventType === "CHECKOUT.ORDER.APPROVED" && paypalOrderId) {
    console.info(`[paypal-webhook] capture_requested eventId=${event.providerEventId} paypalOrderId=${paypalOrderId} linkedOrder=${linkedOrder?.orderNumber || "none"}`);
    await provider.captureOrder(paypalOrderId);
  }

  if (linkedOrder && ["PAYMENT.CAPTURE.COMPLETED", "CHECKOUT.ORDER.COMPLETED"].includes(event.eventType)) {
    await updateOrder(linkedOrder.orderNumber, {
      paymentProvider: "paypal",
      providerCheckoutId: paypalOrderId ?? linkedOrder.providerCheckoutId ?? null,
      providerOrderId: orderNumber ?? paypalOrderId ?? linkedOrder.providerOrderId ?? null,
      providerPaymentId: event.providerPaymentId || linkedOrder.providerPaymentId || null,
      providerEventId: event.providerEventId,
      paymentRecordedAt: new Date().toISOString(),
      firstPaidAt: linkedOrder.firstPaidAt ?? new Date().toISOString(),
      lastPaymentEventAt: new Date().toISOString(),
      metadata: {
        ...linkedOrder.metadata,
        paymentProvider: "paypal",
        providerCheckoutId: paypalOrderId ?? linkedOrder.metadata?.providerCheckoutId ?? null,
        providerOrderId: orderNumber ?? paypalOrderId ?? null,
        providerPaymentId: event.providerPaymentId || null,
        providerEventId: event.providerEventId,
        paymentRecordedAt: new Date().toISOString(),
        lastPaymentEventAt: new Date().toISOString()
      }
    });
    await issueLicenseFromPaidOrder(linkedOrder.orderNumber);
  }
  return Response.json({ success: true, linkedOrder: linkedOrder?.orderNumber || null });
}

export async function GET() {
  return Response.json({ success: true, health: "ok" });
}
