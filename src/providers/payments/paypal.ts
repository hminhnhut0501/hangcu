import type {
  CreateCheckoutInput,
  CreateCheckoutResult,
  PaymentProvider,
  PaymentStatusResult,
  RefundInput,
  RefundResult,
  VerifiedPaymentEvent
} from "./base";

export class PayPalPaymentProvider implements PaymentProvider {
  readonly name = "paypal";

  async createCheckout(_input: CreateCheckoutInput): Promise<CreateCheckoutResult> {
    throw new Error("PayPalPaymentProvider is not configured");
  }

  async verifyWebhook(_request: Request): Promise<VerifiedPaymentEvent> {
    throw new Error("PayPalPaymentProvider is not configured");
  }

  async getPaymentStatus(providerPaymentId: string): Promise<PaymentStatusResult> {
    return {
      providerPaymentId,
      status: "pending"
    };
  }

  async refund(_input: RefundInput): Promise<RefundResult> {
    throw new Error("PayPalPaymentProvider is not configured");
  }
}
