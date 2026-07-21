import type {
  CreateCheckoutInput,
  CreateCheckoutResult,
  PaymentProvider,
  PaymentStatusResult,
  RefundInput,
  RefundResult,
  VerifiedPaymentEvent
} from "./base";

export class ManualPaymentProvider implements PaymentProvider {
  readonly name = "manual";

  async createCheckout(input: CreateCheckoutInput): Promise<CreateCheckoutResult> {
    return {
      checkoutUrl: `${input.returnUrl}?manual_payment=1&order=${encodeURIComponent(input.orderNumber)}`,
      providerCheckoutId: `manual_${input.orderId}`,
      providerPaymentId: `manual_pay_${input.orderId}`
    };
  }

  async verifyWebhook(_request: Request): Promise<VerifiedPaymentEvent> {
    throw new Error("ManualPaymentProvider does not support webhook verification");
  }

  async getPaymentStatus(providerPaymentId: string): Promise<PaymentStatusResult> {
    return {
      providerPaymentId,
      status: "pending"
    };
  }

  async refund(input: RefundInput): Promise<RefundResult> {
    return {
      providerRefundId: `manual_refund_${input.providerPaymentId}`,
      status: "pending"
    };
  }
}
