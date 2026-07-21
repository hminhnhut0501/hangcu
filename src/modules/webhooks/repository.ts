import { getSupabaseServiceClient } from "@/lib/db/supabase-server";
import { isMissingSupabaseTableError } from "@/lib/db/supabase-errors";
import type { PaymentEvent } from "./schema";

const paymentEvents: PaymentEvent[] = [
  {
    id: "evt_1",
    provider: "sandbox",
    providerEventId: "evt_demo_1",
    eventType: "payment.succeeded",
    payload: { orderNumber: "ORD-DEMO1" },
    signatureValid: true,
    processingStatus: "processed",
    errorMessage: null,
    processedAt: new Date()
  }
];

export interface WebhookRepository {
  list(): Promise<PaymentEvent[]>;
  findByProviderEventId(provider: string, providerEventId: string): Promise<PaymentEvent | null>;
  retry(provider: string, providerEventId: string): Promise<PaymentEvent | null>;
}

export class InMemoryWebhookRepository implements WebhookRepository {
  async list(): Promise<PaymentEvent[]> {
    return [...paymentEvents];
  }

  async findByProviderEventId(provider: string, providerEventId: string): Promise<PaymentEvent | null> {
    return (
      paymentEvents.find(
        (entry) => entry.provider === provider && entry.providerEventId === providerEventId
      ) ?? null
    );
  }

  async retry(provider: string, providerEventId: string): Promise<PaymentEvent | null> {
    const event = paymentEvents.find(
      (entry) => entry.provider === provider && entry.providerEventId === providerEventId
    );
    if (!event) {
      return null;
    }

    event.processingStatus = "processed";
    event.errorMessage = null;
    event.processedAt = new Date();
    return event;
  }
}

export class SupabaseWebhookRepository implements WebhookRepository {
  private client = getSupabaseServiceClient();

  async list(): Promise<PaymentEvent[]> {
    if (!this.client) {
      return new InMemoryWebhookRepository().list();
    }

    const { data, error } = await this.client.from("payment_events").select("*").order("created_at", { ascending: false });
    if (error) {
      if (isMissingSupabaseTableError(error, "payment_events")) {
        return new InMemoryWebhookRepository().list();
      }
      throw error;
    }
    return (data ?? []).map((row) => ({
      id: row.id,
      provider: row.provider,
      providerEventId: row.provider_event_id,
      eventType: row.event_type,
      payload: row.payload ?? {},
      signatureValid: row.signature_valid,
      processingStatus: row.processing_status,
      errorMessage: row.error_message ?? null,
      processedAt: row.processed_at ? new Date(row.processed_at) : null
    }));
  }

  async findByProviderEventId(provider: string, providerEventId: string): Promise<PaymentEvent | null> {
    if (!this.client) {
      return new InMemoryWebhookRepository().findByProviderEventId(provider, providerEventId);
    }

    const { data, error } = await this.client
      .from("payment_events")
      .select("*")
      .eq("provider", provider)
      .eq("provider_event_id", providerEventId)
      .maybeSingle();

    if (error) {
      if (isMissingSupabaseTableError(error, "payment_events")) {
        return new InMemoryWebhookRepository().findByProviderEventId(provider, providerEventId);
      }
      throw error;
    }
    if (!data) return null;

    return {
      id: data.id,
      provider: data.provider,
      providerEventId: data.provider_event_id,
      eventType: data.event_type,
      payload: data.payload ?? {},
      signatureValid: data.signature_valid,
      processingStatus: data.processing_status,
      errorMessage: data.error_message ?? null,
      processedAt: data.processed_at ? new Date(data.processed_at) : null
    };
  }

  async retry(provider: string, providerEventId: string): Promise<PaymentEvent | null> {
    if (!this.client) {
      return new InMemoryWebhookRepository().retry(provider, providerEventId);
    }

    const { data, error } = await this.client
      .from("payment_events")
      .update({
        processing_status: "processed",
        error_message: null,
        processed_at: new Date().toISOString()
      })
      .eq("provider", provider)
      .eq("provider_event_id", providerEventId)
      .select("*")
      .maybeSingle();

    if (error) {
      if (isMissingSupabaseTableError(error, "payment_events")) {
        return new InMemoryWebhookRepository().retry(provider, providerEventId);
      }
      throw error;
    }
    if (!data) return null;

    return {
      id: data.id,
      provider: data.provider,
      providerEventId: data.provider_event_id,
      eventType: data.event_type,
      payload: data.payload ?? {},
      signatureValid: data.signature_valid,
      processingStatus: data.processing_status,
      errorMessage: data.error_message ?? null,
      processedAt: data.processed_at ? new Date(data.processed_at) : null
    };
  }
}
