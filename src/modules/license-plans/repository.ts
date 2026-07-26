import { licensePlansSeed } from "@/lib/license/mock-data";
import { getSupabaseServiceClient } from "@/lib/db/supabase-server";
import { hasSupabasePersistence } from "@/lib/db/persistence";
import { isMissingSupabaseTableError } from "@/lib/db/supabase-errors";
import type { LicensePlanSummary } from "./types";

const plans: LicensePlanSummary[] = [...licensePlansSeed];

export interface LicensePlanRepository {
  list(): Promise<LicensePlanSummary[]>;
  findBySlug(slug: string): Promise<LicensePlanSummary | null>;
  findByCode(code: string): Promise<LicensePlanSummary | null>;
  save(plan: LicensePlanSummary): Promise<LicensePlanSummary>;
  delete(id: string): Promise<boolean>;
}

export class InMemoryLicensePlanRepository implements LicensePlanRepository {
  async list(): Promise<LicensePlanSummary[]> {
    return [...plans];
  }

  async findBySlug(slug: string): Promise<LicensePlanSummary | null> {
    return plans.find((plan) => plan.slug === slug) ?? null;
  }

  async findByCode(code: string): Promise<LicensePlanSummary | null> {
    return plans.find((plan) => plan.code === code) ?? null;
  }

  async save(plan: LicensePlanSummary): Promise<LicensePlanSummary> {
    const index = plans.findIndex((entry) => entry.id === plan.id);
    if (index >= 0) {
      plans[index] = plan;
    } else {
      plans.push(plan);
    }
    return plan;
  }

  async delete(id: string): Promise<boolean> {
    const index = plans.findIndex((entry) => entry.id === id);
    if (index < 0) {
      return false;
    }

    plans.splice(index, 1);
    return true;
  }
}

export function createLicensePlanRepository() {
  if (hasSupabasePersistence()) {
    return new SupabaseLicensePlanRepository();
  }
  return new InMemoryLicensePlanRepository();
}

function mapRowToLicensePlan(row: {
  id: string;
  code: string;
  name: string;
  slug: string;
  description: string | null;
  plan_type: "regular" | "donate_bonus" | "special";
  duration_days: number;
  is_lifetime: boolean;
  status: "active" | "hidden" | "archived";
  sort_order: number;
  metadata: Record<string, unknown> | null;
}): LicensePlanSummary {
  const metadata = row.metadata ?? {};
  const currencyPrices = (metadata.currencyPrices ?? metadata.currency_prices ?? {}) as {
    VND?: number | null;
    USD?: number | null;
  };

  return {
    id: row.id,
    code: row.code,
    name: row.name,
    nameVi: typeof metadata.nameVi === "string" ? metadata.nameVi : row.name,
    nameEn: typeof metadata.nameEn === "string" ? metadata.nameEn : row.name,
    slug: row.slug,
    description: row.description ?? "",
    currencyPrices: {
      VND: typeof currencyPrices.VND === "number" ? currencyPrices.VND : null,
      USD: typeof currencyPrices.USD === "number" ? currencyPrices.USD : null
    },
    planType: row.plan_type,
    durationDays: row.duration_days,
    isLifetime: row.is_lifetime,
    status: row.status,
    sortOrder: row.sort_order,
    entitlementTags: Array.isArray(metadata.entitlementTags)
      ? metadata.entitlementTags.filter((tag): tag is string => typeof tag === "string")
      : [],
    metadata
  };
}

class SupabaseLicensePlanRepository implements LicensePlanRepository {
  private client = getSupabaseServiceClient();

  async list(): Promise<LicensePlanSummary[]> {
    if (!this.client) {
      return [...licensePlansSeed];
    }

    const { data, error } = await this.client
      .from("license_plans")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) {
      if (isMissingSupabaseTableError(error, "license_plans")) {
        return [...licensePlansSeed];
      }
      throw error;
    }

    return (data ?? []).map((row) => mapRowToLicensePlan(row as Parameters<typeof mapRowToLicensePlan>[0]));
  }

  async findBySlug(slug: string): Promise<LicensePlanSummary | null> {
    if (!this.client) {
      return licensePlansSeed.find((plan) => plan.slug === slug) ?? null;
    }

    const { data, error } = await this.client.from("license_plans").select("*").eq("slug", slug).maybeSingle();
    if (error) {
      if (isMissingSupabaseTableError(error, "license_plans")) {
        return licensePlansSeed.find((plan) => plan.slug === slug) ?? null;
      }
      throw error;
    }

    return data ? mapRowToLicensePlan(data as Parameters<typeof mapRowToLicensePlan>[0]) : null;
  }

  async findByCode(code: string): Promise<LicensePlanSummary | null> {
    if (!this.client) {
      return licensePlansSeed.find((plan) => plan.code === code) ?? null;
    }

    const { data, error } = await this.client.from("license_plans").select("*").eq("code", code).maybeSingle();
    if (error) {
      if (isMissingSupabaseTableError(error, "license_plans")) {
        return licensePlansSeed.find((plan) => plan.code === code) ?? null;
      }
      throw error;
    }

    return data ? mapRowToLicensePlan(data as Parameters<typeof mapRowToLicensePlan>[0]) : null;
  }

  async save(plan: LicensePlanSummary): Promise<LicensePlanSummary> {
    if (!this.client) {
      const index = plans.findIndex((entry) => entry.id === plan.id);
      if (index >= 0) {
        plans[index] = plan;
      } else {
        plans.push(plan);
      }
      return plan;
    }

    const { data, error } = await this.client
      .from("license_plans")
      .upsert({
        id: plan.id,
        code: plan.code,
        name: plan.name,
        slug: plan.slug,
        description: plan.description,
        plan_type: plan.planType,
        duration_days: plan.durationDays,
        is_lifetime: plan.isLifetime,
        status: plan.status,
        sort_order: plan.sortOrder,
        metadata: {
          ...plan.metadata,
          nameVi: plan.nameVi,
          nameEn: plan.nameEn,
          currencyPrices: plan.currencyPrices,
          entitlementTags: plan.entitlementTags
        }
      })
      .select("*")
      .maybeSingle();

    if (error || !data) {
      return plan;
    }

    return mapRowToLicensePlan(data as Parameters<typeof mapRowToLicensePlan>[0]);
  }

  async delete(id: string): Promise<boolean> {
    if (!this.client) {
      const index = plans.findIndex((entry) => entry.id === id);
      if (index < 0) {
        return false;
      }

      plans.splice(index, 1);
      return true;
    }

    const { error } = await this.client.from("license_plans").delete().eq("id", id);
    return !error;
  }
}
