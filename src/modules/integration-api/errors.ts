export class IntegrationApiError extends Error {
  constructor(
    public readonly code: string,
    message: string
  ) {
    super(message);
    this.name = "IntegrationApiError";
  }
}

export const integrationErrors = {
  invalidRequest: new IntegrationApiError("INVALID_REQUEST", "Request is invalid."),
  invalidSignature: new IntegrationApiError("INVALID_SIGNATURE", "Signature is invalid."),
  requestExpired: new IntegrationApiError("REQUEST_EXPIRED", "Request is expired."),
  nonceAlreadyUsed: new IntegrationApiError("NONCE_ALREADY_USED", "Nonce has already been used."),
  codeNotFound: new IntegrationApiError("CODE_NOT_FOUND", "License key not found."),
  planNotFound: new IntegrationApiError("PLAN_NOT_FOUND", "License plan not found."),
  codeNotIssued: new IntegrationApiError("CODE_NOT_ISSUED", "License key is not issued."),
  codeAlreadyRedeemed: new IntegrationApiError("CODE_ALREADY_REDEEMED", "License key has already been used."),
  codeExpired: new IntegrationApiError("CODE_EXPIRED", "License key is expired."),
  codeNotActive: new IntegrationApiError("CODE_NOT_ACTIVE", "License key is not active."),
  codeRevoked: new IntegrationApiError("CODE_REVOKED", "License key is revoked."),
  rateLimited: new IntegrationApiError("RATE_LIMITED", "Too many requests."),
  internalError: new IntegrationApiError("INTERNAL_ERROR", "Internal error.")
} as const;
