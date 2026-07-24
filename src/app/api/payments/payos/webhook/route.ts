import { PayOSPaymentProvider } from "@/providers/payments/payos";
import { getWebhookEvent, recordWebhookEvent } from "@/modules/webhooks/service";
import { writeSystemAuditLog } from "@/modules/audit/service";
import { issueLicenseFromPaidOrder } from "@/modules/license-bridge/service";
import { getOrderByMetadataKey } from "@/modules/orders/service";

const provider = new PayOSPaymentProvider();

const WEBHOOK_ORDER_SNAPSHOT_PREFIX = "[payos-webhook] order_snapshot ";
const WEBHOOK_ORDER_SNAPSHOT_FIELDS = [
  "planCode",
  "checkoutKind",
  "paymentSessionId",
  "paymentProvider",
  "locale",
  "currency",
  "source",
  "integrationSource"
] as const;

function buildOrderSnapshotLog(order: {
  orderNumber?: string | null;
  id?: string | null;
  metadata?: Record<string, unknown> | null;
  currency?: string | null;
  totalMinor?: number | null;
} | null) {
  return (
    `${WEBHOOK_ORDER_SNAPSHOT_PREFIX}` +
    `orderNumber=${order?.orderNumber || "n/a"} ` +
    `orderId=${order?.id || "n/a"} ` +
    `requestedPlanCode=${String(order?.metadata?.requestedPlanCode ?? "n/a")} ` +
    WEBHOOK_ORDER_SNAPSHOT_FIELDS.map((field) => {
      const value =
        field === "locale"
          ? String(order?.metadata?.[field] ?? "n/a")
          : field === "currency"
            ? String(order?.currency ?? "n/a")
            : String(order?.metadata?.[field] ?? "n/a");
      return `${field}=${value}`;
    }).join(" ") +
    " " +
    `orderAmount=${String(order?.totalMinor ?? "n/a")}`
  );
}

export async function POST(request: Request) {
  const rawBody = await request.clone().text().catch(() => "");
  console.info(`[payos-webhook] received raw_bytes=${rawBody.length}`);

  let event;
  try {
    event = await provider.verifyWebhook(request);
  } catch (error) {
    console.error(`[payos-webhook] verify_failed error=${error instanceof Error ? error.message : String(error)} rawBody=${rawBody || "empty"}`);
    return Response.json({ success: true, ignored: true }, { status: 200 });
  }

  const payload = JSON.parse(event.rawPayload) as {
    orderCode?: string | number;
    data?: {
      orderCode?: string | number;
      orderId?: string | number;
      paymentLinkId?: string | number;
    };
  };
  const orderCode = String(payload.orderCode ?? payload.data?.orderCode ?? payload.data?.orderId ?? "");
  const paymentLinkId = String(payload.data?.paymentLinkId ?? "");
  const linkedOrder =
    (orderCode ? await getOrderByMetadataKey("payosOrderCode", orderCode) : null) ||
    (paymentLinkId ? await getOrderByMetadataKey("providerCheckoutId", paymentLinkId) : null);
  const existingEvent = await getWebhookEvent("payos", event.providerEventId);

  console.info(
    `[payos-webhook] eventId=${event.providerEventId} orderCode=${orderCode || "n/a"} paymentLinkId=${paymentLinkId || "n/a"} linkedOrder=${linkedOrder?.orderNumber || "none"} duplicate=${existingEvent ? "yes" : "no"}`
  );
  console.info(buildOrderSnapshotLog(linkedOrder));

  if (existingEvent?.processingStatus === "processed") {
    console.info(
      `[payos-webhook] skip duplicate eventId=${event.providerEventId} orderCode=${orderCode || "n/a"} linkedOrder=${linkedOrder?.orderNumber || "none"}`
    );
    return Response.json({ success: true, duplicate: true });
  }

  await recordWebhookEvent({
    id: crypto.randomUUID(),
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
    console.info(
      `[payos-webhook] dispatch license issue eventId=${event.providerEventId} orderCode=${orderCode} paymentLinkId=${paymentLinkId || "n/a"} linkedOrder=${linkedOrder?.orderNumber || "none"}`
    );
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

export async function GET() {
  return Response.json({ success: true, health: "ok" });
}
