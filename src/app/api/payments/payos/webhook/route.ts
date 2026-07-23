import { PayOSPaymentProvider } from "@/providers/payments/payos";
import { recordWebhookEvent } from "@/modules/webhooks/service";
import { writeSystemAuditLog } from "@/modules/audit/service";
import { issueLicenseFromPaidOrder } from "@/modules/license-bridge/service";
import { getOrderByMetadataKey } from "@/modules/orders/service";

const provider = new PayOSPaymentProvider();

export async function POST(request: Request) {
  const event = await provider.verifyWebhook(request);
  const payload = JSON.parse(event.rawPayload) as {
    orderCode?: string | number;
    data?: {
      orderCode?: string | number;
      orderId?: string | number;
    };
  };
  const orderCode = String(payload.orderCode ?? payload.data?.orderCode ?? payload.data?.orderId ?? "");
  const linkedOrder = orderCode ? await getOrderByMetadataKey("payosOrderCode", orderCode) : null;

  console.info(
    `[payos-webhook] eventId=${event.providerEventId} orderCode=${orderCode || "n/a"} linkedOrder=${linkedOrder?.orderNumber || "none"}`
  );

  await recordWebhookEvent({
    id: `evt_${event.providerEventId}`,
    provider: "payos",
    providerEventId: event.providerEventId,
    eventType: event.eventType,
    payload: JSON.parse(event.rawPayload),
    signatureValid: true,
    processingStatus: "processed",
    errorMessage: null,
    processedAt: new Date()
  });

  if (orderCode) {
    await issueLicenseFromPaidOrder(linkedOrder?.orderNumber ?? orderCode);
  }

  await writeSystemAuditLog({
    action: "payment_event_received",
    entityType: "payment_event",
    entityId: event.providerEventId,
    afterData: {
      provider: "payos",
      providerEventId: event.providerEventId,
      eventType: event.eventType
    }
  });

  return Response.json({ success: true });
}
