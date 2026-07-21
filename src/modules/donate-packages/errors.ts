export class DonatePackageNotFoundError extends Error {
  constructor() {
    super("Donate package not found");
    this.name = "DonatePackageNotFoundError";
  }
}
