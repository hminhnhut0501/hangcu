export class FulfillmentError extends Error {
  constructor(message = "Fulfillment failed") {
    super(message);
    this.name = "FulfillmentError";
  }
}
