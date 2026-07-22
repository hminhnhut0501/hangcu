import { ManualPaymentProvider } from "@/providers/payments/manual";
import { PayOSPaymentProvider } from "@/providers/payments/payos";
import { SandboxPaymentProvider } from "@/providers/payments/sandbox";
import { PayPalPaymentProvider } from "@/providers/payments/paypal";
import { StripePaymentProvider } from "@/providers/payments/stripe";
import type { CreateCheckoutResult, PaymentProvider } from "@/providers/payments/base";
import { PaymentProviderNotConfiguredError } from "./errors";
import type { PaymentIntentDraft } from "./types";

const providers: Record<PaymentIntentDraft["provider"], PaymentProvider> = {
  manual: new ManualPaymentProvider(),
  sandbox: new SandboxPaymentProvider(),
  stripe: new StripePaymentProvider(),
  paypal: new PayPalPaymentProvider(),
  payos: new PayOSPaymentProvider()
};

export function getPaymentProvider(name: PaymentIntentDraft["provider"]) {
  return providers[name];
}

export async function createPaymentCheckout(input: PaymentIntentDraft & { returnUrl: string; cancelUrl: string }): Promise<CreateCheckoutResult> {
  const provider = getPaymentProvider(input.provider);
  if (provider instanceof StripePaymentProvider || provider instanceof PayPalPaymentProvider) {
    throw new PaymentProviderNotConfiguredError();
  }

  return provider.createCheckout({
    orderId: input.orderId,
    orderNumber: input.orderNumber,
    amountMinor: input.amountMinor,
    currency: input.currency,
    customerEmail: input.customerEmail,
    returnUrl: input.returnUrl,
    cancelUrl: input.cancelUrl
  });
}
