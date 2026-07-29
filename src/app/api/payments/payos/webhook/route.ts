import { PayOSPaymentProvider } from "@/providers/payments/payos";
import { getWebhookEvent, recordWebhookEvent, updateWebhookStatus } from "@/modules/webhooks/service";
import { writeSystemAuditLog } from "@/modules/audit/service";
import { issueLicenseFromPaidOrder } from "@/modules/license-bridge/service";
import { getOrderByMetadataKey, updateOrder } from "@/modules/orders/service";

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

type WebhookSnapshotOrder = {
  orderNumber?: string | null;
  id?: string | null;
  metadata?: Record<string, unknown> | null;
  currency?: string | null;
  totalMinor?: number | null;
};

function formatWebhookSnapshotField(order: WebhookSnapshotOrder | null, field: (typeof WEBHOOK_ORDER_SNAPSHOT_FIELDS)[number]) {
  if (!order) return `${field}=n/a`;
  if (field === "currency") return `${field}=${String(order.currency ?? "n/a")}`;
  if (field === "locale") return `${field}=${String(order.metadata?.locale ?? "n/a")}`;
  return `${field}=${String(order.metadata?.[field] ?? "n/a")}`;
}

function buildOrderSnapshotLog(order: WebhookSnapshotOrder | null) {
  const orderedFields = WEBHOOK_ORDER_SNAPSHOT_FIELDS.map((field) => formatWebhookSnapshotField(order, field)).join(" ");
  return (
    `${WEBHOOK_ORDER_SNAPSHOT_PREFIX}` +
    `orderNumber=${order?.orderNumber || "n/a"} ` +
    `orderId=${order?.id || "n/a"} ` +
    `requestedPlanCode=${String(order?.metadata?.requestedPlanCode ?? "n/a")} ` +
    `${orderedFields} ` +
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

  if (existingEvent?.processingStatus === "failed") {
    console.info(`[payos-webhook] retrying failed eventId=${event.providerEventId}`);
  }

  if (!existingEvent) {
    await recordWebhookEvent({
      id: crypto.randomUUID(),
      provider: "payos",
      providerEventId: event.providerEventId,
      eventType: event.eventType,
      payload: JSON.parse(event.rawPayload),
      signatureValid: true,
      processingStatus: "pending",
      errorMessage: null,
      processedAt: null
    });
  }

  if (orderCode) {
    const providerPaymentId = String(payload.data?.orderCode ?? payload.data?.paymentLinkId ?? "");
    await updateOrder(linkedOrder?.orderNumber ?? orderCode, {
      paymentProvider: "payos",
      providerCheckoutId: paymentLinkId || linkedOrder?.providerCheckoutId || null,
      providerOrderId: orderCode || null,
      providerPaymentId: providerPaymentId || null,
      providerEventId: event.providerEventId,
      paymentRecordedAt: new Date().toISOString(),
      firstPaidAt: linkedOrder?.firstPaidAt ?? new Date().toISOString(),
      lastPaymentEventAt: new Date().toISOString(),
      paymentReceiptUrl: linkedOrder?.paymentReceiptUrl ?? null,
      metadata: {
        ...(linkedOrder?.metadata ?? {}),
        paymentProvider: "payos",
        providerCheckoutId: paymentLinkId || linkedOrder?.metadata?.providerCheckoutId || null,
        providerOrderId: orderCode,
        providerPaymentId,
        providerEventId: event.providerEventId,
        lastPaymentEventAt: new Date().toISOString(),
        paymentRecordedAt: new Date().toISOString()
      }
    });
    console.info(
      `[payos-webhook] dispatch license issue eventId=${event.providerEventId} orderCode=${orderCode} paymentLinkId=${paymentLinkId || "n/a"} linkedOrder=${linkedOrder?.orderNumber || "none"}`
    );
    try {
      await issueLicenseFromPaidOrder(linkedOrder?.orderNumber ?? orderCode);
      await updateWebhookStatus("payos", event.providerEventId, "processed");
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      await updateWebhookStatus("payos", event.providerEventId, "failed", message);
      console.error(`[payos-webhook] processing_failed eventId=${event.providerEventId} linkedOrder=${linkedOrder?.orderNumber || "none"} error=${message}`);
      return Response.json({ success: false, error: "processing_failed" }, { status: 500 });
    }
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
