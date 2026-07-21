import type { OrderSummary } from "./types";

export interface OrderRepository {
  create(order: OrderSummary): Promise<OrderSummary>;
  findByOrderNumber(orderNumber: string): Promise<OrderSummary | null>;
  listByEmail(email: string): Promise<OrderSummary[]>;
  listAll(): Promise<OrderSummary[]>;
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
}
