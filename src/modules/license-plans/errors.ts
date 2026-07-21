export class LicensePlanNotFoundError extends Error {
  constructor() {
    super("License plan not found");
    this.name = "LicensePlanNotFoundError";
  }
}
