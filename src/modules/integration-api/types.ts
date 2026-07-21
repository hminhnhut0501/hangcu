export type IntegrationApiSuccess<T> = {
  success: true;
  data: T;
};

export type IntegrationApiError = {
  success: false;
  error: {
    code: string;
    message: string;
  };
};

export type IntegrationApiResponse<T> = IntegrationApiSuccess<T> | IntegrationApiError;

export type LicenseKeyRedeemRequest = {
  code: string;
  externalUserId: string;
  externalUsername?: string;
  timestamp: number;
  nonce: string;
  signature: string;
};

export type LicenseKeyStatusRequest = {
  code: string;
  externalUserId: string;
  timestamp: number;
  nonce: string;
  signature: string;
};

export type LicenseKeyRevokeRequest = {
  code: string;
  reason: string;
  timestamp: number;
  nonce: string;
  signature: string;
};

export type CheckoutRequest = {
  orderId: string;
  telegramUserId?: string;
  customerRef?: string;
  planCode: string;
  locale: "vi" | "en";
  currency: "VND" | "USD";
  activationCode?: string;
  returnUrl?: string;
  cancelUrl?: string;
  timestamp: number;
  nonce: string;
  signature: string;
};
