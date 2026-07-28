export type PaymentIntentDraft = {
  orderId: string;
  orderNumber: string;
  amountMinor: number;
  currency: string;
  customerEmail?: string;
  provider: "manual" | "sandbox" | "stripe" | "paypal" | "lemonsqueezy" | "payos" | "creem";
  metadata?: Record<string, unknown>;
};
