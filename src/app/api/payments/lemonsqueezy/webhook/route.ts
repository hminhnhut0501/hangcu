import { LemonSqueezyPaymentProvider } from "@/providers/payments/lemonsqueezy";
import { getWebhookEvent, recordWebhookEvent } from "@/modules/webhooks/service";
import { getOrderByOrderNumber, updateOrder } from "@/modules/orders/service";
import { issueLicenseFromPaidOrder } from "@/modules/license-bridge/service";

const provider = new LemonSqueezyPaymentProvider();

export async function POST(request: Request) {
  let event;
  try {
    event = await provider.verifyWebhook(request);
  } catch (error) {
    console.error(`[lemonsqueezy-webhook] verify_failed error=${error instanceof Error ? error.message : String(error)}`);
    return Response.json({ success: false, error: "Webhook verification failed" }, { status: 400 });
  }
  const payload = JSON.parse(event.rawPayload) as {
    meta?: { custom_data?: { orderNumber?: string; orderId?: string } };
    data?: {
      id?: string;
      attributes?: { status?: string };
    };
  };
  const orderNumber = String(payload.meta?.custom_data?.orderNumber || "");
  const linkedOrder = orderNumber ? await getOrderByOrderNumber(orderNumber) : null;
  const existingEvent = await getWebhookEvent("lemonsqueezy", event.providerEventId);
  console.info(`[lemonsqueezy-webhook] eventId=${event.providerEventId} eventType=${event.eventType} orderNumber=${orderNumber || "none"} linkedOrder=${linkedOrder?.orderNumber || "none"} duplicate=${existingEvent ? "yes" : "no"}`);
  if (existingEvent?.processingStatus === "processed") return Response.json({ success: true, duplicate: true });
  await recordWebhookEvent({ id: crypto.randomUUID(), provider: "lemonsqueezy", providerEventId: event.providerEventId, eventType: event.eventType, payload: JSON.parse(event.rawPayload), signatureValid: true, processingStatus: "processed", errorMessage: null, processedAt: new Date() });
  const status = String(payload.data?.attributes?.status || "").toLowerCase();
  if (linkedOrder && (event.eventType === "order_created" || event.eventType === "order_payment_success") && status === "paid") {
    await updateOrder(linkedOrder.orderNumber, {
      paymentProvider: "lemonsqueezy",
      providerCheckoutId: String(payload.data?.id ?? linkedOrder.providerCheckoutId ?? ""),
      providerOrderId: String(payload.data?.id ?? linkedOrder.providerOrderId ?? ""),
      providerPaymentId: event.providerPaymentId || linkedOrder.providerPaymentId || null,
      providerEventId: event.providerEventId,
      paymentRecordedAt: new Date().toISOString(),
      firstPaidAt: linkedOrder.firstPaidAt ?? new Date().toISOString(),
      lastPaymentEventAt: new Date().toISOString(),
      metadata: {
        ...linkedOrder.metadata,
        paymentProvider: "lemonsqueezy",
        providerCheckoutId: String(payload.data?.id ?? linkedOrder.metadata?.providerCheckoutId ?? ""),
        providerOrderId: String(payload.data?.id ?? linkedOrder.metadata?.providerOrderId ?? ""),
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
