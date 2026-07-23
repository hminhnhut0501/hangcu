import type { LicenseKey } from "./schema";
import { hashLicenseKey } from "@/lib/crypto/hash";
import { getSupabaseServiceClient } from "@/lib/db/supabase-server";
import { hasSupabasePersistence } from "@/lib/db/persistence";

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
  if (hasSupabasePersistence()) {
    return new SupabaseLicenseKeyRepository();
  }
  return new InMemoryLicenseKeyRepository();
}

function parseDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function mapRowToLicenseKey(row: {
  id: string;
  license_plan_id: string;
  code_hash: string;
  encrypted_code: string | null;
  code_last_four: string;
  status: "available" | "reserved" | "issued" | "redeemed" | "expired" | "revoked";
  order_id: string | null;
  order_item_id: string | null;
  customer_id: string | null;
  customer_ref: string | null;
  external_user_id: string | null;
  binding_type: "telegram_user_id" | "device_id" | "external_user" | null;
  issued_at: string | null;
  expires_at: string | null;
  redeemed_at: string | null;
  redeemed_by_external_user_id: string | null;
  revoked_at: string | null;
  revoked_reason: string | null;
  entitlement_snapshot: string[] | null;
  metadata: Record<string, unknown> | null;
}): LicenseKey {
  return {
    id: row.id,
    licensePlanId: row.license_plan_id,
    codeHash: row.code_hash,
    encryptedCode: row.encrypted_code,
    codeLastFour: row.code_last_four,
    status: row.status,
    orderId: row.order_id,
    orderItemId: row.order_item_id,
    customerId: row.customer_id,
    customerRef: row.customer_ref,
    externalUserId: row.external_user_id,
    bindingType: row.binding_type,
    issuedAt: parseDate(row.issued_at),
    expiresAt: parseDate(row.expires_at),
    redeemedAt: parseDate(row.redeemed_at),
    redeemedByExternalUserId: row.redeemed_by_external_user_id,
    revokedAt: parseDate(row.revoked_at),
    revokedReason: row.revoked_reason,
    entitlementSnapshot: row.entitlement_snapshot ?? [],
    metadata: row.metadata ?? {}
  };
}

class SupabaseLicenseKeyRepository implements LicenseKeyRepository {
  private client = getSupabaseServiceClient();

  async list(): Promise<LicenseKey[]> {
    if (!this.client) {
      return [...licenseKeys];
    }

    const { data, error } = await this.client
      .from("license_keys")
      .select("*")
      .order("created_at", { ascending: true });

    if (error || !data?.length) {
      return [...licenseKeys];
    }

    return data.map((row) => mapRowToLicenseKey(row as Parameters<typeof mapRowToLicenseKey>[0]));
  }

  async findByHash(codeHash: string): Promise<LicenseKey | null> {
    if (!this.client) {
      return licenseKeys.find((licenseKey) => licenseKey.codeHash === codeHash) ?? null;
    }

    const { data, error } = await this.client.from("license_keys").select("*").eq("code_hash", codeHash).maybeSingle();
    if (error || !data) {
      return licenseKeys.find((licenseKey) => licenseKey.codeHash === codeHash) ?? null;
    }

    return mapRowToLicenseKey(data as Parameters<typeof mapRowToLicenseKey>[0]);
  }

  async findByLastFour(lastFour: string): Promise<LicenseKey[]> {
    const target = lastFour.toUpperCase();
    if (!this.client) {
      return licenseKeys.filter((licenseKey) => licenseKey.codeLastFour === target);
    }

    const { data, error } = await this.client.from("license_keys").select("*").eq("code_last_four", target);
    if (error || !data?.length) {
      return licenseKeys.filter((licenseKey) => licenseKey.codeLastFour === target);
    }

    return data.map((row) => mapRowToLicenseKey(row as Parameters<typeof mapRowToLicenseKey>[0]));
  }

  async findAvailableByPlanId(licensePlanId: string): Promise<LicenseKey | null> {
    if (!this.client) {
      const key = licenseKeys.find(
        (entry) => entry.licensePlanId === licensePlanId && entry.status === "available"
      );
      if (!key) return null;
      key.status = "reserved";
      return key;
    }

    const { data, error } = await this.client
      .from("license_keys")
      .select("*")
      .eq("license_plan_id", licensePlanId)
      .eq("status", "available")
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      const key = licenseKeys.find(
        (entry) => entry.licensePlanId === licensePlanId && entry.status === "available"
      );
      if (!key) return null;
      key.status = "reserved";
      return key;
    }

    const mapped = mapRowToLicenseKey(data as Parameters<typeof mapRowToLicenseKey>[0]);
    const { error: updateError } = await this.client
      .from("license_keys")
      .update({ status: "reserved" })
      .eq("id", mapped.id);
    return updateError ? mapped : { ...mapped, status: "reserved" };
  }

  async findById(id: string): Promise<LicenseKey | null> {
    if (!this.client) {
      return licenseKeys.find((licenseKey) => licenseKey.id === id) ?? null;
    }

    const { data, error } = await this.client.from("license_keys").select("*").eq("id", id).maybeSingle();
    if (error || !data) {
      return licenseKeys.find((licenseKey) => licenseKey.id === id) ?? null;
    }

    return mapRowToLicenseKey(data as Parameters<typeof mapRowToLicenseKey>[0]);
  }

  async save(licenseKey: LicenseKey): Promise<LicenseKey> {
    if (!this.client) {
      const index = licenseKeys.findIndex((entry) => entry.id === licenseKey.id);
      if (index >= 0) {
        licenseKeys[index] = licenseKey;
      } else {
        licenseKeys.push(licenseKey);
      }
      return licenseKey;
    }

    const { data, error } = await this.client
      .from("license_keys")
      .upsert({
        id: licenseKey.id,
        license_plan_id: licenseKey.licensePlanId,
        code_hash: licenseKey.codeHash,
        encrypted_code: licenseKey.encryptedCode,
        code_last_four: licenseKey.codeLastFour,
        status: licenseKey.status,
        order_id: licenseKey.orderId,
        order_item_id: licenseKey.orderItemId,
        customer_id: licenseKey.customerId,
        customer_ref: licenseKey.customerRef,
        external_user_id: licenseKey.externalUserId,
        binding_type: licenseKey.bindingType,
        issued_at: licenseKey.issuedAt?.toISOString() ?? null,
        expires_at: licenseKey.expiresAt?.toISOString() ?? null,
        redeemed_at: licenseKey.redeemedAt?.toISOString() ?? null,
        redeemed_by_external_user_id: licenseKey.redeemedByExternalUserId,
        revoked_at: licenseKey.revokedAt?.toISOString() ?? null,
        revoked_reason: licenseKey.revokedReason,
        entitlement_snapshot: licenseKey.entitlementSnapshot,
        metadata: licenseKey.metadata
      })
      .select("*")
      .maybeSingle();

    if (error || !data) {
      return licenseKey;
    }

    return mapRowToLicenseKey(data as Parameters<typeof mapRowToLicenseKey>[0]);
  }
}
