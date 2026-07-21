export class CheckoutValidationError extends Error {
  constructor(message = "Checkout validation failed") {
    super(message);
    this.name = "CheckoutValidationError";
  }
}
