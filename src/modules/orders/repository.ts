import { getSupabaseServiceClient } from "@/lib/db/supabase-server";
import { hasSupabasePersistence } from "@/lib/db/persistence";
import { isMissingSupabaseTableError } from "@/lib/db/supabase-errors";
import type { OrderSummary } from "./types";

export interface OrderRepository {
  create(order: OrderSummary): Promise<OrderSummary>;
  findByOrderNumber(orderNumber: string): Promise<OrderSummary | null>;
  findByMetadataKey(key: string, value: string): Promise<OrderSummary | null>;
  listByEmail(email: string): Promise<OrderSummary[]>;
  listAll(): Promise<OrderSummary[]>;
  update(orderNumber: string, patch: Partial<OrderSummary>): Promise<OrderSummary | null>;
}

export class InMemoryOrderRepository implements OrderRepository {
  private readonly orders = new Map<string, OrderSummary>();

  async create(order: OrderSummary): Promise<OrderSummary> {
    this.orders.set(order.orderNumber, order);
    return order;
  }

  async findByOrderNumber(orderNumber: string): Promise<OrderSummary | null> {
    return this.orders.get(orderNumber) ?? null;
  }

  async findByMetadataKey(key: string, value: string): Promise<OrderSummary | null> {
    return (
      [...this.orders.values()].find((order) => String(order.metadata?.[key] ?? "") === value) ?? null
    );
  }

  async listByEmail(email: string): Promise<OrderSummary[]> {
    return [...this.orders.values()].filter(
      (order) => order.customerEmail.toLowerCase() === email.toLowerCase()
    );
  }

  async listAll(): Promise<OrderSummary[]> {
    return [...this.orders.values()];
  }

  async update(orderNumber: string, patch: Partial<OrderSummary>): Promise<OrderSummary | null> {
    const current = this.orders.get(orderNumber);
    if (!current) {
      return null;
    }

    const updated = {
      ...current,
      ...patch,
      items: patch.items ?? current.items,
      metadata: patch.metadata ?? current.metadata
    };

    this.orders.set(orderNumber, updated);
    return updated;
  }
}

function mapRowToOrderSummary(row: {
  id: string;
  order_number: string;
  customer_email: string;
  currency: string;
  subtotal_minor: number;
  discount_minor: number;
  total_minor: number;
  status: OrderSummary["status"];
  payment_status: OrderSummary["paymentStatus"];
  fulfillment_status: OrderSummary["fulfillmentStatus"];
  source: string;
  notes: string | null;
  metadata: Record<string, unknown> | null;
  items: OrderSummary["items"] | null;
  created_at?: string | null;
  updated_at?: string | null;
}): OrderSummary {
  return {
    id: row.id,
    orderNumber: row.order_number,
    customerEmail: row.customer_email,
    currency: row.currency,
    subtotalMinor: Number(row.subtotal_minor ?? 0),
    discountMinor: Number(row.discount_minor ?? 0),
    totalMinor: Number(row.total_minor ?? 0),
    status: row.status,
    paymentStatus: row.payment_status,
    fulfillmentStatus: row.fulfillment_status,
    source: row.source,
    notes: row.notes,
    metadata: row.metadata ?? {},
    items: row.items ?? []
  };
}

class SupabaseOrderRepository implements OrderRepository {
  private client = getSupabaseServiceClient();

  async create(order: OrderSummary): Promise<OrderSummary> {
    if (!this.client) {
      return new InMemoryOrderRepository().create(order);
    }

    const payload = {
      id: order.id,
      order_number: order.orderNumber,
      customer_email: order.customerEmail,
      currency: order.currency,
      subtotal_minor: order.subtotalMinor,
      discount_minor: order.discountMinor,
      total_minor: order.totalMinor,
      status: order.status,
      payment_status: order.paymentStatus,
      fulfillment_status: order.fulfillmentStatus,
      source: order.source,
      notes: order.notes,
      metadata: order.metadata,
      items: order.items
    };

    const { data, error } = await this.client
      .from("orders")
      .upsert(payload, { onConflict: "order_number" })
      .select("*")
      .maybeSingle();

    if (error) {
      if (isMissingSupabaseTableError(error, "orders")) {
        return new InMemoryOrderRepository().create(order);
      }
      throw error;
    }

    return data ? mapRowToOrderSummary(data as Parameters<typeof mapRowToOrderSummary>[0]) : order;
  }

  async findByOrderNumber(orderNumber: string): Promise<OrderSummary | null> {
    if (!this.client) {
      return new InMemoryOrderRepository().findByOrderNumber(orderNumber);
    }

    const { data, error } = await this.client
      .from("orders")
      .select("*")
      .eq("order_number", orderNumber)
      .maybeSingle();

    if (error) {
      if (isMissingSupabaseTableError(error, "orders")) {
        return new InMemoryOrderRepository().findByOrderNumber(orderNumber);
      }
      throw error;
    }

    return data ? mapRowToOrderSummary(data as Parameters<typeof mapRowToOrderSummary>[0]) : null;
  }

  async findByMetadataKey(key: string, value: string): Promise<OrderSummary | null> {
    if (!this.client) {
      return new InMemoryOrderRepository().findByMetadataKey(key, value);
    }

    const { data, error } = await this.client
      .from("orders")
      .select("*")
      .contains("metadata", { [key]: value })
      .maybeSingle();

    if (error) {
      if (isMissingSupabaseTableError(error, "orders")) {
        return new InMemoryOrderRepository().findByMetadataKey(key, value);
      }
      throw error;
    }

    if (data) {
      return mapRowToOrderSummary(data as Parameters<typeof mapRowToOrderSummary>[0]);
    }

  const { data: listData, error: listError } = await this.client.from("orders").select("*").order("created_at", {
      ascending: false
    });
    if (listError) {
      if (isMissingSupabaseTableError(listError, "orders")) {
        return new InMemoryOrderRepository().findByMetadataKey(key, value);
      }
      throw listError;
    }

    const matched = (listData ?? []).find(
      (row) => String((row as { metadata?: Record<string, unknown> }).metadata?.[key] ?? "") === value
    );
    return matched ? mapRowToOrderSummary(matched as Parameters<typeof mapRowToOrderSummary>[0]) : null;
  }

  async listByEmail(email: string): Promise<OrderSummary[]> {
    if (!this.client) {
      return new InMemoryOrderRepository().listByEmail(email);
    }

    const { data, error } = await this.client
      .from("orders")
      .select("*")
      .ilike("customer_email", email)
      .order("created_at", { ascending: false });

    if (error) {
      if (isMissingSupabaseTableError(error, "orders")) {
        return new InMemoryOrderRepository().listByEmail(email);
      }
      throw error;
    }

    return (data ?? []).map((row) => mapRowToOrderSummary(row as Parameters<typeof mapRowToOrderSummary>[0]));
  }

  async listAll(): Promise<OrderSummary[]> {
    if (!this.client) {
      return new InMemoryOrderRepository().listAll();
    }

    const { data, error } = await this.client.from("orders").select("*").order("created_at", { ascending: false });

    if (error) {
      if (isMissingSupabaseTableError(error, "orders")) {
        return new InMemoryOrderRepository().listAll();
      }
      throw error;
    }

    return (data ?? []).map((row) => mapRowToOrderSummary(row as Parameters<typeof mapRowToOrderSummary>[0]));
  }

  async update(orderNumber: string, patch: Partial<OrderSummary>): Promise<OrderSummary | null> {
    if (!this.client) {
      return new InMemoryOrderRepository().update(orderNumber, patch);
    }

    const payload = {
      ...(patch.id ? { id: patch.id } : {}),
      ...(patch.customerEmail ? { customer_email: patch.customerEmail } : {}),
      ...(patch.currency ? { currency: patch.currency } : {}),
      ...(patch.subtotalMinor != null ? { subtotal_minor: patch.subtotalMinor } : {}),
      ...(patch.discountMinor != null ? { discount_minor: patch.discountMinor } : {}),
      ...(patch.totalMinor != null ? { total_minor: patch.totalMinor } : {}),
      ...(patch.status ? { status: patch.status } : {}),
      ...(patch.paymentStatus ? { payment_status: patch.paymentStatus } : {}),
      ...(patch.fulfillmentStatus ? { fulfillment_status: patch.fulfillmentStatus } : {}),
      ...(patch.source ? { source: patch.source } : {}),
      ...(patch.notes !== undefined ? { notes: patch.notes } : {}),
      ...(patch.metadata ? { metadata: patch.metadata } : {}),
      ...(patch.items ? { items: patch.items } : {})
    };

    const { data, error } = await this.client
      .from("orders")
      .update(payload)
      .eq("order_number", orderNumber)
      .select("*")
      .maybeSingle();

    if (error) {
      if (isMissingSupabaseTableError(error, "orders")) {
        return new InMemoryOrderRepository().update(orderNumber, patch);
      }
      throw error;
    }

    return data ? mapRowToOrderSummary(data as Parameters<typeof mapRowToOrderSummary>[0]) : null;
  }
}

export function createOrderRepository() {
  if (hasSupabasePersistence()) {
    return new SupabaseOrderRepository();
  }
  return new InMemoryOrderRepository();
}
