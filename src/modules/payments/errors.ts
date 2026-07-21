export class PaymentProviderNotConfiguredError extends Error {
  constructor() {
    super("Payment provider not configured");
    this.name = "PaymentProviderNotConfiguredError";
  }
}
