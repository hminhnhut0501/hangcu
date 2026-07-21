import { generateRandomToken } from "@/lib/crypto/hash";
import type {
  CreateCheckoutInput,
  CreateCheckoutResult,
  PaymentProvider,
  PaymentStatusResult,
  RefundInput,
  RefundResult,
  VerifiedPaymentEvent
} from "./base";

export class SandboxPaymentProvider implements PaymentProvider {
  readonly name = "sandbox";

  async createCheckout(input: CreateCheckoutInput): Promise<CreateCheckoutResult> {
    return {
      checkoutUrl: `${input.returnUrl}?sandbox=1&checkout=${generateRandomToken(12)}`,
      providerCheckoutId: `sandbox_${input.orderId}`,
      providerPaymentId: `sandbox_pay_${input.orderId}`
    };
  }

  async verifyWebhook(request: Request): Promise<VerifiedPaymentEvent> {
    const rawPayload = await request.text();

    return {
      providerEventId: `evt_${generateRandomToken(8)}`,
      eventType: "payment.succeeded",
      providerPaymentId: `sandbox_pay_${generateRandomToken(8)}`,
      amountMinor: 0,
      currency: "USD",
      rawPayload
    };
  }

  async getPaymentStatus(providerPaymentId: string): Promise<PaymentStatusResult> {
    return {
      providerPaymentId,
      status: "paid"
    };
  }

  async refund(input: RefundInput): Promise<RefundResult> {
    return {
      providerRefundId: `sandbox_refund_${input.providerPaymentId}`,
      status: "succeeded"
    };
  }
}
