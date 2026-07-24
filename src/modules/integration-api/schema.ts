import { z } from "zod";

export const integrationBaseSchema = z.object({
  timestamp: z.number().int(),
  nonce: z.string().min(8),
  signature: z.string().min(1)
});

export const redeemLicenseKeyRequestSchema = integrationBaseSchema.extend({
  licenseKey: z.string().min(1),
  externalUserId: z.string().min(1),
  externalUsername: z.string().optional()
});

export const licenseKeyStatusRequestSchema = integrationBaseSchema.extend({
  licenseKey: z.string().min(1),
  externalUserId: z.string().min(1)
});

export const licenseKeyRevokeRequestSchema = integrationBaseSchema.extend({
  licenseKey: z.string().min(1),
  reason: z.string().min(1)
});

export const checkoutRequestSchema = integrationBaseSchema.extend({
  orderId: z.string().min(1),
  telegramUserId: z.string().min(1).optional(),
  customerRef: z.string().min(1).optional(),
  planCode: z.string().min(1).optional(),
  vipPlanCode: z.string().min(1).optional(),
  amountMinor: z.coerce.number().int().positive().optional(),
  locale: z.enum(["vi", "en"]),
  currency: z.enum(["VND", "USD"]),
  activationCode: z.string().min(1).optional(),
  returnUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional()
  ,source: z.string().min(1).optional()
  ,paymentSessionId: z.string().min(1).optional()
});

export type RedeemLicenseKeyInput = z.infer<typeof redeemLicenseKeyRequestSchema>;
export type LicenseKeyStatusInput = z.infer<typeof licenseKeyStatusRequestSchema>;
export type LicenseKeyRevokeInput = z.infer<typeof licenseKeyRevokeRequestSchema>;
export type CheckoutRequestInput = z.infer<typeof checkoutRequestSchema>;
