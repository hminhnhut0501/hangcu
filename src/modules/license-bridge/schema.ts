import { z } from "zod";

export const integrationBaseSchema = z.object({
  timestamp: z.number().int(),
  nonce: z.string().min(8),
  signature: z.string().min(1)
});

const optionalUrlSchema = z.preprocess((value) => {
  if (value === "" || value === null) {
    return undefined;
  }
  return value;
}, z.string().url().optional());

export const licenseCheckoutSchema = integrationBaseSchema.extend({
  orderId: z.string().min(1),
  telegramUserId: z.string().min(1).optional(),
  customerRef: z.string().min(1).optional(),
  planCode: z.string().min(1).optional(),
  vipPlanCode: z.string().min(1).optional(),
  amountMinor: z.coerce.number().int().positive().optional(),
  locale: z.enum(["vi", "en"]).optional(),
  currency: z.enum(["VND", "USD"]),
  activationCode: z.string().min(1).optional(),
  returnUrl: optionalUrlSchema,
  cancelUrl: optionalUrlSchema,
  source: z.string().min(1).optional(),
  paymentSessionId: z.string().min(1).optional()
});

export const licenseVerifySchema = integrationBaseSchema.extend({
  licenseKey: z.string().min(1),
  telegramUserId: z.string().min(1)
});

export const licenseStatusSchema = integrationBaseSchema.extend({
  licenseKey: z.string().min(1),
  telegramUserId: z.string().min(1).optional()
});

export const licenseRevokeSchema = integrationBaseSchema.extend({
  licenseKey: z.string().min(1),
  reason: z.string().min(1)
});

export type LicenseCheckoutInput = z.infer<typeof licenseCheckoutSchema>;
export type LicenseVerifyInput = z.infer<typeof licenseVerifySchema>;
export type LicenseStatusInput = z.infer<typeof licenseStatusSchema>;
export type LicenseRevokeInput = z.infer<typeof licenseRevokeSchema>;
