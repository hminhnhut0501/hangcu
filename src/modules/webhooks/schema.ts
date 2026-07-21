import { z } from "zod";

export const paymentEventStatusSchema = z.enum(["pending", "processed", "failed"]);

export const paymentEventSchema = z.object({
  id: z.string(),
  provider: z.string().min(1),
  providerEventId: z.string().min(1),
  eventType: z.string().min(1),
  payload: z.record(z.string(), z.unknown()),
  signatureValid: z.boolean(),
  processingStatus: paymentEventStatusSchema,
  errorMessage: z.string().nullable(),
  processedAt: z.date().nullable()
});

export type PaymentEvent = z.infer<typeof paymentEventSchema>;
