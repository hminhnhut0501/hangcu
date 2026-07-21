import type { LicenseKey } from "./schema";

export type LicenseKeyIssueInput = {
  licensePlanId: string;
  orderId: string;
  orderItemId: string;
  customerId?: string | null;
  customerRef?: string | null;
  externalUserId?: string | null;
  code: string;
  expiresAt: Date | null;
  bindingType?: "telegram_user_id" | "device_id" | "external_user" | null;
  entitlementSnapshot?: string[];
  metadata?: Record<string, unknown>;
};

export type LicenseKeyAllocation = {
  planId: string;
  quantity: number;
};

export type LicenseKeyRedeemResult = {
  licenseKey: LicenseKey;
};
