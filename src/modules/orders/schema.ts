import { z } from "zod";

export const orderStatusSchema = z.enum([
  "pending",
  "paid",
  "processing",
  "fulfilled",
  "failed",
  "cancelled"
]);

export const paymentStatusSchema = z.enum([
  "unpaid",
  "pending",
  "paid",
  "failed",
  "refunded",
  "partially_refunded"
]);

export const fulfillmentStatusSchema = z.enum([
  "unfulfilled",
  "processing",
  "partially_fulfilled",
  "fulfilled",
  "failed"
]);

export const orderItemSnapshotSchema = z.object({
  productId: z.string(),
  sku: z.string(),
  productName: z.string(),
  quantity: z.number().int().positive(),
  unitAmountMinor: z.number().int().nonnegative(),
  totalAmountMinor: z.number().int().nonnegative(),
  productSnapshot: z.record(z.string(), z.unknown()),
  rewardSnapshot: z.record(z.string(), z.unknown()).optional()
});

export const orderSchema = z.object({
  id: z.string(),
  orderNumber: z.string(),
  customerEmail: z.string().email(),
  currency: z.string().length(3),
  subtotalMinor: z.number().int().nonnegative(),
  discountMinor: z.number().int().nonnegative(),
  totalMinor: z.number().int().nonnegative(),
  status: orderStatusSchema,
  paymentStatus: paymentStatusSchema,
  fulfillmentStatus: fulfillmentStatusSchema,
  source: z.string(),
  notes: z.string().nullable(),
  paymentProvider: z.string().nullable().optional(),
  providerCheckoutId: z.string().nullable().optional(),
  providerOrderId: z.string().nullable().optional(),
  providerPaymentId: z.string().nullable().optional(),
  providerEventId: z.string().nullable().optional(),
  paymentReceiptUrl: z.string().nullable().optional(),
  fulfillmentMethod: z.string(),
  deliveryLicenseKeyIds: z.array(z.string()),
  deliveryProof: z.record(z.string(), z.unknown()),
  deliveredAt: z.string().nullable().optional(),
  paymentRecordedAt: z.string().nullable().optional(),
  firstPaidAt: z.string().nullable().optional(),
  lastPaymentEventAt: z.string().nullable().optional(),
  metadata: z.record(z.string(), z.unknown()),
  items: z.array(orderItemSnapshotSchema)
});

export type Order = z.infer<typeof orderSchema>;
export type OrderItemSnapshot = z.infer<typeof orderItemSnapshotSchema>;
