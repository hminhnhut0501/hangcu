import type {
  CreateCheckoutInput,
  CreateCheckoutResult,
  PaymentProvider,
  PaymentStatusResult,
  RefundInput,
  RefundResult,
  VerifiedPaymentEvent
} from "./base";

export class StripePaymentProvider implements PaymentProvider {
  readonly name = "stripe";

  async createCheckout(_input: CreateCheckoutInput): Promise<CreateCheckoutResult> {
    throw new Error("StripePaymentProvider is not configured");
  }

  async verifyWebhook(_request: Request): Promise<VerifiedPaymentEvent> {
    throw new Error("StripePaymentProvider is not configured");
  }

  async getPaymentStatus(providerPaymentId: string): Promise<PaymentStatusResult> {
    return {
      providerPaymentId,
      status: "pending"
    };
  }

  async refund(_input: RefundInput): Promise<RefundResult> {
    throw new Error("StripePaymentProvider is not configured");
  }
}
