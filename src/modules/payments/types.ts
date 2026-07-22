export type PaymentIntentDraft = {
  orderId: string;
  orderNumber: string;
  amountMinor: number;
  currency: string;
  customerEmail: string;
  provider: "manual" | "sandbox" | "stripe" | "paypal" | "payos";
};
