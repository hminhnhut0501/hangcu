import type { OrderSummary } from "../orders/types";

export type CheckoutSummary = {
  itemsCount: number;
  subtotalMinor: number;
  discountMinor: number;
  totalMinor: number;
  currency: string;
  order: OrderSummary;
};
