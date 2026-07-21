import type { ProductSummary } from "../products/types";
import { InMemoryOrderRepository } from "./repository";
import type { OrderDraft, OrderSummary } from "./types";

const orderRepository = new InMemoryOrderRepository();

function createOrderNumber() {
  const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `ORD-${suffix}`;
}

function calculateTotals(items: OrderDraft["items"]) {
  return items.reduce(
    (acc, item) => {
      acc.subtotalMinor += item.totalAmountMinor;
      return acc;
    },
    { subtotalMinor: 0 }
  );
}

export function buildOrderDraftFromProducts(input: {
  customerEmail: string;
  source: string;
  products: ProductSummary[];
  notes?: string | null;
}) {
  const items = input.products.map((product) => ({
    productId: product.id,
    sku: product.sku,
    productName: product.name,
    quantity: 1,
    unitAmountMinor: product.amountMinor,
    totalAmountMinor: product.amountMinor,
    productSnapshot: {
      name: product.name,
      slug: product.slug,
      shortDescription: product.shortDescription,
      status: product.status,
      downloadLimit: product.downloadLimit,
      downloadExpiryDays: product.downloadExpiryDays
    }
  }));

  return {
    customerEmail: input.customerEmail,
    currency: input.products[0]?.currency ?? "USD",
    source: input.source,
    notes: input.notes ?? null,
    items
  } satisfies OrderDraft;
}

export async function createOrder(draft: OrderDraft) {
  const totals = calculateTotals(draft.items);
  const orderNumber = createOrderNumber();
  const order: OrderSummary = {
    id: `order_${orderNumber.toLowerCase()}`,
    orderNumber,
    customerEmail: draft.customerEmail,
    currency: draft.currency,
    subtotalMinor: totals.subtotalMinor,
    discountMinor: 0,
    totalMinor: totals.subtotalMinor,
    status: "pending",
    paymentStatus: "unpaid",
    fulfillmentStatus: "unfulfilled",
    source: draft.source,
    notes: draft.notes ?? null,
    metadata: draft.metadata ?? {},
    items: draft.items
  };

  return orderRepository.create(order);
}

export async function getOrderByOrderNumber(orderNumber: string) {
  return orderRepository.findByOrderNumber(orderNumber);
}

export async function listOrdersByEmail(email: string) {
  return orderRepository.listByEmail(email);
}

export async function listAllOrders() {
  return orderRepository.listAll();
}
