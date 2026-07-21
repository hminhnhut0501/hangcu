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
  metadata: z.record(z.string(), z.unknown()),
  items: z.array(orderItemSnapshotSchema)
});

export type Order = z.infer<typeof orderSchema>;
export type OrderItemSnapshot = z.infer<typeof orderItemSnapshotSchema>;
