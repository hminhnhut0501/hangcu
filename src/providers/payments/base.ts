export type CreateCheckoutInput = {
  orderId: string;
  orderNumber: string;
  amountMinor: number;
  currency: string;
  customerEmail: string;
  returnUrl: string;
  cancelUrl: string;
  metadata?: Record<string, unknown>;
};

export type CreateCheckoutResult = {
  checkoutUrl: string;
  providerCheckoutId: string;
  providerPaymentId?: string;
};

export type VerifiedPaymentEvent = {
  providerEventId: string;
  eventType: string;
  providerPaymentId: string;
  amountMinor: number;
  currency: string;
  rawPayload: string;
};

export type PaymentStatusResult = {
  providerPaymentId: string;
  status: "pending" | "paid" | "failed" | "refunded";
};

export type RefundInput = {
  providerPaymentId: string;
  amountMinor: number;
  currency: string;
  reason?: string;
};

export type RefundResult = {
  providerRefundId: string;
  status: "succeeded" | "pending" | "failed";
};

export interface PaymentProvider {
  readonly name: string;
  createCheckout(input: CreateCheckoutInput): Promise<CreateCheckoutResult>;
  verifyWebhook(request: Request): Promise<VerifiedPaymentEvent>;
  getPaymentStatus(providerPaymentId: string): Promise<PaymentStatusResult>;
  refund(input: RefundInput): Promise<RefundResult>;
}
