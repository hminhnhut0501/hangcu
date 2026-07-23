import type { ProductSummary } from "../products/types";
import { createOrderRepository } from "./repository";
import type { OrderDraft, OrderSummary } from "./types";
import { randomUUID } from "crypto";

const orderRepository = createOrderRepository();

function createOrderNumber() {
  const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `ORD-${suffix}`;
}

function createOrderId() {
  return typeof randomUUID === "function" ? randomUUID() : `order_${createOrderNumber().toLowerCase()}`;
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
  const now = new Date().toISOString();
  const totals = calculateTotals(draft.items);
  const orderNumber = createOrderNumber();
  const order: OrderSummary = {
    id: createOrderId(),
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
    metadata: {
      ...(draft.metadata ?? {}),
      createdAt: now,
      updatedAt: now
    },
    items: draft.items
  };

  return orderRepository.create(order);
}

export async function getOrderByOrderNumber(orderNumber: string) {
  return orderRepository.findByOrderNumber(orderNumber);
}

export async function getOrderByMetadataKey(key: string, value: string) {
  return orderRepository.findByMetadataKey(key, value);
}

export async function listOrdersByEmail(email: string) {
  return orderRepository.listByEmail(email);
}

export async function listAllOrders() {
  return orderRepository.listAll();
}

export async function updateOrder(orderNumber: string, patch: Partial<OrderSummary>) {
  const current = await orderRepository.findByOrderNumber(orderNumber);
  if (!current) {
    return null;
  }

  return orderRepository.update(orderNumber, {
    ...patch,
    metadata: {
      ...current.metadata,
      ...(patch.metadata ?? {}),
      updatedAt: new Date().toISOString()
    }
  });
}
