import { generateRandomToken, hashLicenseKey, normalizeLicenseKeyForLookup } from "@/lib/crypto/hash";
import { createLicenseKeyRepository } from "./repository";
import { LicenseKeyNotFoundError, LicenseKeyUnavailableError } from "./errors";
import type { LicenseKeyIssueInput } from "./types";
import { integrationErrors } from "../integration-api/errors";

const repository = createLicenseKeyRepository();

export async function issueLicenseKey(input: LicenseKeyIssueInput) {
  const normalized = normalizeLicenseKeyForLookup(input.code);
  const existing = await repository.findByHash(hashLicenseKey(normalized));
  if (existing) {
    return existing;
  }

  return repository.save({
    id: `lk_${generateRandomToken(8)}`,
    licensePlanId: input.licensePlanId,
    codeHash: hashLicenseKey(normalized),
    encryptedCode: `encrypted:${normalized}`,
    codeLastFour: normalized.slice(-4),
    status: "issued",
    orderId: input.orderId,
    orderItemId: input.orderItemId,
    customerId: input.customerId ?? null,
    customerRef: input.customerRef ?? null,
    externalUserId: input.externalUserId ?? null,
    bindingType: input.bindingType ?? null,
    issuedAt: new Date(),
    expiresAt: input.expiresAt,
    redeemedAt: null,
    redeemedByExternalUserId: null,
    revokedAt: null,
    revokedReason: null,
    entitlementSnapshot: input.entitlementSnapshot ?? [],
    metadata: input.metadata ?? {}
  });
}

export async function allocateAvailableLicenseKey(planId: string) {
  const key = await repository.findAvailableByPlanId(planId);
  if (!key) {
    throw new LicenseKeyUnavailableError();
  }
  return key;
}

export async function getLicenseKeyStatus(code: string) {
  const normalized = normalizeLicenseKeyForLookup(code);
  return repository.findByHash(hashLicenseKey(normalized));
}

export async function redeemLicenseKey(input: {
  code: string;
  externalUserId: string;
}) {
  const key = await getLicenseKeyStatus(input.code);

  if (!key) {
    throw new LicenseKeyNotFoundError();
  }

  if (key.status === "available" || key.status === "reserved") {
    throw integrationErrors.codeNotIssued;
  }
  if (key.status === "expired") {
    throw integrationErrors.codeExpired;
  }
  if (key.status === "revoked") {
    throw integrationErrors.codeRevoked;
  }
  if (key.status === "redeemed") {
    throw integrationErrors.codeAlreadyRedeemed;
  }

  return repository.save({
    ...key,
    status: "redeemed",
    redeemedAt: new Date(),
    redeemedByExternalUserId: input.externalUserId
  });
}

export async function finalizeAllocatedLicenseKey(input: {
  licenseKeyId: string;
  orderId: string;
  orderItemId: string;
  customerId?: string | null;
  customerRef?: string | null;
  externalUserId?: string | null;
  bindingType?: "telegram_user_id" | "device_id" | "external_user" | null;
  entitlementSnapshot?: string[];
  expiresAt: Date | null;
}) {
  const key = (await repository.list()).find((entry) => entry.id === input.licenseKeyId) ?? null;
  if (!key) {
    throw new LicenseKeyNotFoundError();
  }

  return repository.save({
    ...key,
    status: "issued",
    orderId: input.orderId,
    orderItemId: input.orderItemId,
    customerId: input.customerId ?? key.customerId,
    customerRef: input.customerRef ?? key.customerRef,
    externalUserId: input.externalUserId ?? key.externalUserId,
    bindingType: input.bindingType ?? key.bindingType,
    issuedAt: new Date(),
    expiresAt: input.expiresAt,
    entitlementSnapshot: input.entitlementSnapshot ?? key.entitlementSnapshot
  });
}

export function getLicenseKeyEntitlements(input: {
  entitlementSnapshot?: string[] | null;
  planEntitlements?: string[] | null;
}) {
  const entitlements = input.entitlementSnapshot?.length ? input.entitlementSnapshot : input.planEntitlements ?? [];
  return Array.from(new Set(entitlements));
}

export async function revokeLicenseKey(input: { code: string; reason: string }) {
  const key = await getLicenseKeyStatus(input.code);
  if (!key) {
    throw new LicenseKeyNotFoundError();
  }

  return repository.save({
    ...key,
    status: "revoked",
    revokedAt: new Date(),
    revokedReason: input.reason
  });
}

export async function listLicenseKeys() {
  return repository.list();
}

export async function createLicenseKey(input: LicenseKeyIssueInput) {
  return issueLicenseKey(input);
}
