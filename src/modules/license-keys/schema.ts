import { z } from "zod";

export const licenseKeyStatusSchema = z.enum([
  "available",
  "reserved",
  "issued",
  "redeemed",
  "expired",
  "revoked"
]);

export const licenseKeySchema = z.object({
  id: z.string(),
  licensePlanId: z.string(),
  codeHash: z.string().min(1),
  encryptedCode: z.string().nullable(),
  codeLastFour: z.string().length(4),
  status: licenseKeyStatusSchema,
  orderId: z.string().nullable(),
  orderItemId: z.string().nullable(),
  customerId: z.string().nullable(),
  customerRef: z.string().nullable(),
  externalUserId: z.string().nullable(),
  bindingType: z.enum(["telegram_user_id", "device_id", "external_user"]).nullable(),
  issuedAt: z.date().nullable(),
  expiresAt: z.date().nullable(),
  redeemedAt: z.date().nullable(),
  redeemedByExternalUserId: z.string().nullable(),
  revokedAt: z.date().nullable(),
  revokedReason: z.string().nullable(),
  entitlementSnapshot: z.array(z.string()),
  metadata: z.record(z.string(), z.unknown())
});

export type LicenseKey = z.infer<typeof licenseKeySchema>;
