import type { OrderSummary } from "./types";

export interface OrderRepository {
  create(order: OrderSummary): Promise<OrderSummary>;
  findByOrderNumber(orderNumber: string): Promise<OrderSummary | null>;
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
