import { SupabaseWebhookRepository } from "./repository";
import type { WebhookSummary } from "./types";
import { writeSystemAuditLog } from "../audit/service";

const webhookRepository = new SupabaseWebhookRepository();

export async function listWebhookSummaries(): Promise<WebhookSummary[]> {
  const events = await webhookRepository.list();
  return events.map((event) => ({
    provider: event.provider,
    eventId: event.providerEventId,
    eventType: event.eventType,
    signatureValid: event.signatureValid,
    processingStatus: event.processingStatus,
    errorMessage: event.errorMessage,
    receivedAt: event.processedAt?.toISOString() ?? new Date().toISOString()
  }));
}

export async function retryWebhook(provider: string, providerEventId: string) {
  const event = await webhookRepository.retry(provider, providerEventId);
  if (event) {
    await writeSystemAuditLog({
      action: "webhook_retried",
      entityType: "payment_event",
      entityId: providerEventId,
      afterData: {
        provider,
        providerEventId,
        processingStatus: event.processingStatus
      }
    });
  }
  return event;
}
