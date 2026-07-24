import { LemonSqueezyPaymentProvider } from "@/providers/payments/lemonsqueezy";
import { getWebhookEvent, recordWebhookEvent } from "@/modules/webhooks/service";
import { getOrderByOrderNumber } from "@/modules/orders/service";
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
  const payload = JSON.parse(event.rawPayload) as { meta?: { custom_data?: { orderNumber?: string; orderId?: string } }; data?: { attributes?: { status?: string } } };
  const orderNumber = String(payload.meta?.custom_data?.orderNumber || "");
  const linkedOrder = orderNumber ? await getOrderByOrderNumber(orderNumber) : null;
  const existingEvent = await getWebhookEvent("lemonsqueezy", event.providerEventId);
  console.info(`[lemonsqueezy-webhook] eventId=${event.providerEventId} eventType=${event.eventType} orderNumber=${orderNumber || "none"} linkedOrder=${linkedOrder?.orderNumber || "none"} duplicate=${existingEvent ? "yes" : "no"}`);
  if (existingEvent?.processingStatus === "processed") return Response.json({ success: true, duplicate: true });
  await recordWebhookEvent({ id: crypto.randomUUID(), provider: "lemonsqueezy", providerEventId: event.providerEventId, eventType: event.eventType, payload: JSON.parse(event.rawPayload), signatureValid: true, processingStatus: "processed", errorMessage: null, processedAt: new Date() });
  const status = String(payload.data?.attributes?.status || "").toLowerCase();
  if (linkedOrder && (event.eventType === "order_created" || event.eventType === "order_payment_success") && status === "paid") await issueLicenseFromPaidOrder(linkedOrder.orderNumber);
  return Response.json({ success: true, linkedOrder: linkedOrder?.orderNumber || null });
}

export async function GET() {
  return Response.json({ success: true, health: "ok" });
}
