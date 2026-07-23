import { hmacSha256 } from "@/lib/crypto/hash";
import {
  checkoutRequestSchema,
  licenseKeyRevokeRequestSchema,
  licenseKeyStatusRequestSchema,
  redeemLicenseKeyRequestSchema,
  type CheckoutRequestInput,
  type LicenseKeyRevokeInput,
  type LicenseKeyStatusInput,
  type RedeemLicenseKeyInput
} from "./schema";
import { integrationErrors } from "./errors";
import { getLicenseKeyEntitlements, getLicenseKeyStatus, redeemLicenseKey, revokeLicenseKey } from "../license-keys/service";
import { getLicensePlanByCode, getLicensePlanById } from "../license-plans/service";

const usedNonces = new Map<string, number>();
const requestCounts = new Map<string, { count: number; windowStart: number }>();

function pruneStores(now: number) {
  for (const [nonce, expiresAt] of usedNonces) {
    if (expiresAt <= now) {
      usedNonces.delete(nonce);
    }
  }
}

function consumeNonce(nonce: string, now: number) {
  pruneStores(now);
  if (usedNonces.has(nonce)) {
    throw integrationErrors.nonceAlreadyUsed;
  }
  usedNonces.set(nonce, now + 5 * 60 * 1000);
}

function rateLimit(key: string, now: number) {
  const windowMs = 60 * 1000;
  const limit = 60;
  const state = requestCounts.get(key);

  if (!state || now - state.windowStart >= windowMs) {
    requestCounts.set(key, { count: 1, windowStart: now });
    return;
  }

  if (state.count >= limit) {
    throw integrationErrors.rateLimited;
  }

  state.count += 1;
}

export function getIntegrationSecret() {
  return (
    process.env.BOT_WEB_HMAC_SECRET ??
    process.env.WEB_PAYMENT_SECRET ??
    process.env.LICENSE_WEBHOOK_SECRET ??
    process.env.BOT_API_SECRET ??
    process.env.APP_HMAC_SECRET ??
    null
  );
}

export function buildIntegrationSignature(input: {
  timestamp: number;
  nonce: string;
  rawBody: string;
}) {
  const secret = getIntegrationSecret();
  if (!secret) {
    throw integrationErrors.internalError;
  }

  return hmacSha256(secret, `${input.timestamp}.${input.nonce}.${input.rawBody}`);
}

export function verifyIntegrationRequest(input: {
  timestamp: number;
  nonce: string;
  signature: string;
  rawBody: string;
  rateLimitKey: string;
}) {
  const secret = getIntegrationSecret();
  if (!secret) {
    throw integrationErrors.internalError;
  }

  const now = Date.now();
  const requestAge = Math.abs(now - input.timestamp * 1000);
  if (requestAge > 5 * 60 * 1000) {
    throw integrationErrors.requestExpired;
  }

  const expected = hmacSha256(secret, `${input.timestamp}.${input.nonce}.${input.rawBody}`);
  if (expected !== input.signature) {
    throw integrationErrors.invalidSignature;
  }

  rateLimit(input.rateLimitKey, now);
  consumeNonce(input.nonce, now);
}

export async function redeemLicenseKeyViaIntegration(input: RedeemLicenseKeyInput) {
  const parsed = redeemLicenseKeyRequestSchema.parse(input);
  const licenseKey = await redeemLicenseKey({
    code: parsed.licenseKey,
    externalUserId: parsed.externalUserId
  });

  const licensePlan = await getLicensePlanById(licenseKey.licensePlanId);
  if (!licensePlan) {
    throw integrationErrors.internalError;
  }

  return {
    licensePlanCode: licensePlan.code,
    licensePlanSlug: licensePlan.slug,
    startsAt: licenseKey.issuedAt?.toISOString() ?? new Date().toISOString(),
    endsAt: licensePlan.isLifetime ? null : new Date(Date.now() + licensePlan.durationDays * 86400000).toISOString(),
    isLifetime: licensePlan.isLifetime,
    bindingType: licenseKey.bindingType,
    customerRef: licenseKey.customerRef,
    externalUserId: licenseKey.externalUserId,
    entitlements: getLicenseKeyEntitlements({
      entitlementSnapshot: licenseKey.entitlementSnapshot,
      planEntitlements: licensePlan.entitlementTags
    })
  };
}

export async function getLicenseKeyStatusViaIntegration(input: LicenseKeyStatusInput) {
  const parsed = licenseKeyStatusRequestSchema.parse(input);
  const licenseKey = await getLicenseKeyStatus(parsed.licenseKey);

  if (!licenseKey) {
    throw integrationErrors.codeNotFound;
  }

  return {
    codeLastFour: licenseKey.codeLastFour,
    status: licenseKey.status,
    revokedReason: licenseKey.revokedReason,
    expiresAt: licenseKey.expiresAt?.toISOString() ?? null,
    bindingType: licenseKey.bindingType,
    customerRef: licenseKey.customerRef,
    externalUserId: licenseKey.externalUserId,
    entitlements: getLicenseKeyEntitlements({
      entitlementSnapshot: licenseKey.entitlementSnapshot,
      planEntitlements: (await getLicensePlanById(licenseKey.licensePlanId))?.entitlementTags ?? []
    })
  };
}

export async function revokeLicenseKeyViaIntegration(input: LicenseKeyRevokeInput) {
  const parsed = licenseKeyRevokeRequestSchema.parse(input);
  const licenseKey = await revokeLicenseKey({
    code: parsed.licenseKey,
    reason: parsed.reason
  });

  return {
    codeLastFour: licenseKey.codeLastFour,
    status: licenseKey.status
  };
}

export async function createCheckoutViaIntegration(input: CheckoutRequestInput) {
  const parsed = checkoutRequestSchema.parse(input);
  const plan = await getLicensePlanByCode(parsed.planCode);
  if (!plan) {
    throw integrationErrors.planNotFound;
  }

  const paymentProvider = parsed.currency === "VND" ? "PAYOS" : "STRIPE";
  const appBaseUrl = process.env.NEXT_PUBLIC_APP_URL;
  const fallbackReturnUrl = appBaseUrl ? `${appBaseUrl.replace(/\/$/, "")}/checkout` : null;
  const resolvedReturnUrl = parsed.returnUrl ?? fallbackReturnUrl;

  if (!resolvedReturnUrl) {
    throw integrationErrors.internalError;
  }

  const price = plan.currencyPrices[parsed.currency];
  if (price == null) {
    throw integrationErrors.internalError;
  }

  const checkoutUrl = `${resolvedReturnUrl}${resolvedReturnUrl.includes("?") ? "&" : "?"}order_id=${encodeURIComponent(parsed.orderId)}`;

  return {
    checkoutUrl,
    orderId: parsed.orderId,
    paymentProvider,
    currency: parsed.currency,
    planCode: plan.code,
    locale: parsed.locale,
    activationCode: parsed.activationCode ?? null,
    telegramUserId: parsed.telegramUserId ?? null,
    customerRef: parsed.customerRef ?? null,
    entitlements: plan.entitlementTags
  };
}
