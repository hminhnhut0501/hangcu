import type { PaymentEvent } from "./schema";

export type WebhookSummary = {
  provider: string;
  eventId: string;
  eventType: string;
  signatureValid: boolean;
  processingStatus: PaymentEvent["processingStatus"];
  errorMessage: string | null;
  receivedAt: string;
};
