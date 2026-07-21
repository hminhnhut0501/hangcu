export class LicenseKeyNotFoundError extends Error {
  constructor() {
    super("License key not found");
    this.name = "LicenseKeyNotFoundError";
  }
}

export class LicenseKeyUnavailableError extends Error {
  constructor() {
    super("No license key available");
    this.name = "LicenseKeyUnavailableError";
  }
}
