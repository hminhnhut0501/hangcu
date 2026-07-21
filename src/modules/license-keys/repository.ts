import type { LicenseKey } from "./schema";
import { hashLicenseKey } from "@/lib/crypto/hash";

const licenseKeys: LicenseKey[] = [
  {
    id: "lk_1",
    licensePlanId: "lp_30d",
    codeHash: hashLicenseKey("HC-7KM4-R2NX-P9VA"),
    encryptedCode: "encrypted:HC-7KM4-R2NX-P9VA",
    codeLastFour: "P9VA",
    status: "available",
    orderId: null,
    orderItemId: null,
    customerId: null,
    customerRef: null,
    externalUserId: null,
    bindingType: null,
    issuedAt: null,
    expiresAt: null,
    redeemedAt: null,
    redeemedByExternalUserId: null,
    revokedAt: null,
    revokedReason: null,
    entitlementSnapshot: ["app_access", "vip_group_access"],
    metadata: {}
  }
];

export interface LicenseKeyRepository {
  list(): Promise<LicenseKey[]>;
  findByHash(codeHash: string): Promise<LicenseKey | null>;
  findByLastFour(lastFour: string): Promise<LicenseKey[]>;
  findAvailableByPlanId(licensePlanId: string): Promise<LicenseKey | null>;
  findById(id: string): Promise<LicenseKey | null>;
  save(licenseKey: LicenseKey): Promise<LicenseKey>;
}

export class InMemoryLicenseKeyRepository implements LicenseKeyRepository {
  async list(): Promise<LicenseKey[]> {
    return [...licenseKeys];
  }

  async findByHash(codeHash: string): Promise<LicenseKey | null> {
    return licenseKeys.find((licenseKey) => licenseKey.codeHash === codeHash) ?? null;
  }

  async findByLastFour(lastFour: string): Promise<LicenseKey[]> {
    return licenseKeys.filter((licenseKey) => licenseKey.codeLastFour === lastFour.toUpperCase());
  }

  async findAvailableByPlanId(licensePlanId: string): Promise<LicenseKey | null> {
    const key = licenseKeys.find(
      (entry) => entry.licensePlanId === licensePlanId && entry.status === "available"
    );
    if (!key) return null;
    key.status = "reserved";
    return key;
  }

  async findById(id: string): Promise<LicenseKey | null> {
    return licenseKeys.find((licenseKey) => licenseKey.id === id) ?? null;
  }

  async save(licenseKey: LicenseKey): Promise<LicenseKey> {
    const index = licenseKeys.findIndex((entry) => entry.id === licenseKey.id);
    if (index >= 0) {
      licenseKeys[index] = licenseKey;
    } else {
      licenseKeys.push(licenseKey);
    }
    return licenseKey;
  }
}

export function createLicenseKeyRepository() {
  return new InMemoryLicenseKeyRepository();
}
