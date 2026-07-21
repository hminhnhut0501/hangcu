import type { Order, OrderItemSnapshot } from "./schema";

export type OrderDraftItem = {
  productId: string;
  sku: string;
  productName: string;
  quantity: number;
  unitAmountMinor: number;
  totalAmountMinor: number;
  productSnapshot: Record<string, unknown>;
  rewardSnapshot?: Record<string, unknown>;
};

export type OrderDraft = {
  customerEmail: string;
  currency: string;
  source: string;
  notes?: string | null;
  metadata?: Record<string, unknown>;
  items: OrderDraftItem[];
};

export type OrderSummary = Order & {
  items: OrderItemSnapshot[];
};
