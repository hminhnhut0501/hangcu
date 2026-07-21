export class PriceNotFoundError extends Error {
  constructor() {
    super("Price not found");
    this.name = "PriceNotFoundError";
  }
}
