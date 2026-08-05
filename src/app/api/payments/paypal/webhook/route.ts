import { PayPalPaymentProvider } from "@/providers/payments/paypal";
import { getWebhookEvent, recordWebhookEvent } from "@/modules/webhooks/service";
import { getOrderByMetadataKey, getOrderByOrderNumber, updateOrder } from "@/modules/orders/service";
import { issueLicenseFromPaidOrder } from "@/modules/license-bridge/service";

const provider = new PayPalPaymentProvider();

function validEmail(value: unknown): value is string {
  return typeof value === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function payerEmailFromResource(resource: Record<string, unknown>) {
  const payer = (resource.payer || {}) as Record<string, unknown>;
  const paymentSource = (resource.payment_source || {}) as Record<string, unknown>;
  const paypalSource = (paymentSource.paypal || {}) as Record<string, unknown>;
  const candidates = [payer.email_address, payer.email, paypalSource.email_address];
  const email = candidates.find(validEmail);
  return email ? email.trim().toLowerCase() : null;
}

async function persistPayerEmail(order: Awaited<ReturnType<typeof getOrderByOrderNumber>>, email: string | null, payerId: string | null) {
  if (!order || !email && !payerId) return order;
  return updateOrder(order.orderNumber, {
    ...(email ? { customerEmail: email } : {}),
    metadata: {
      ...(email ? { paypalPayerEmail: email, payerEmail: email } : {}),
      ...(payerId ? { paypalPayerId: payerId } : {})
    }
  });
}

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
      payer?: { payer_id?: string; email_address?: string };
      payment_source?: { paypal?: { email_address?: string } };
      supplementary_data?: { related_ids?: { order_id?: string } };
    };
  };
  const resource = payload.resource || {};
  const resourceRecord = resource as Record<string, unknown>;
  const payerEmail = payerEmailFromResource(resourceRecord);
  const payer = (resource.payer || {}) as { payer_id?: string };
  const payerId = typeof payer.payer_id === "string" ? payer.payer_id : null;
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
    const orderWithPayer = await persistPayerEmail(linkedOrder, payerEmail, payerId);
    if (orderWithPayer && (payerEmail || payerId)) {
      console.info(`[paypal-webhook] payer_snapshot orderNumber=${orderWithPayer.orderNumber} payerEmail=${payerEmail || "n/a"} payerId=${payerId || "n/a"} source=approved_event`);
    }
    console.info(`[paypal-webhook] capture_requested eventId=${event.providerEventId} paypalOrderId=${paypalOrderId} linkedOrder=${linkedOrder?.orderNumber || "none"}`);
    await provider.captureOrder(paypalOrderId);
  }

  if (linkedOrder && ["PAYMENT.CAPTURE.COMPLETED", "CHECKOUT.ORDER.COMPLETED"].includes(event.eventType)) {
    let resolvedPayerEmail = payerEmail;
    let resolvedPayerId = payerId;
    if (!resolvedPayerEmail && paypalOrderId) {
      try {
        const details = await provider.getOrderDetails(paypalOrderId);
        const detailsRecord = details as Record<string, unknown>;
        resolvedPayerEmail = payerEmailFromResource(detailsRecord);
        const detailsPayer = (detailsRecord.payer || {}) as Record<string, unknown>;
        resolvedPayerId = resolvedPayerId || (typeof detailsPayer.payer_id === "string" ? detailsPayer.payer_id : null);
      } catch (error) {
        console.warn(`[paypal-webhook] payer_lookup_failed orderNumber=${linkedOrder.orderNumber} paypalOrderId=${paypalOrderId} error=${error instanceof Error ? error.message : String(error)}`);
      }
    }
    const orderWithPayer = await persistPayerEmail(linkedOrder, resolvedPayerEmail, resolvedPayerId);
    const payerMetadata = {
      ...(resolvedPayerEmail ? { paypalPayerEmail: resolvedPayerEmail, payerEmail: resolvedPayerEmail } : {}),
      ...(resolvedPayerId ? { paypalPayerId: resolvedPayerId } : {})
    };
    await updateOrder(linkedOrder.orderNumber, {
      ...(resolvedPayerEmail ? { customerEmail: resolvedPayerEmail } : {}),
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
        lastPaymentEventAt: new Date().toISOString(),
        ...payerMetadata
      }
    });
    if (orderWithPayer && (resolvedPayerEmail || resolvedPayerId)) {
      console.info(`[paypal-webhook] payer_snapshot orderNumber=${orderWithPayer.orderNumber} payerEmail=${resolvedPayerEmail || "n/a"} payerId=${resolvedPayerId || "n/a"} source=${payerEmail ? "capture_event" : "order_details"}`);
    }
    await issueLicenseFromPaidOrder(linkedOrder.orderNumber);
  }
  return Response.json({ success: true, linkedOrder: linkedOrder?.orderNumber || null });
}

export async function GET() {
  return Response.json({ success: true, health: "ok" });
}
