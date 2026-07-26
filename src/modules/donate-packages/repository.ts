import { donatePackagesSeed } from "@/lib/license/mock-data";
import { getSupabaseServiceClient } from "@/lib/db/supabase-server";
import { hasSupabasePersistence } from "@/lib/db/persistence";
import { isMissingSupabaseTableError } from "@/lib/db/supabase-errors";
import type { DonatePackageSummary } from "./types";

const packages: DonatePackageSummary[] = [...donatePackagesSeed];

export interface DonatePackageRepository {
  list(): Promise<DonatePackageSummary[]>;
  findBySlug(slug: string): Promise<DonatePackageSummary | null>;
  findByCode(code: string): Promise<DonatePackageSummary | null>;
  save(pkg: DonatePackageSummary): Promise<DonatePackageSummary>;
}

function mapRowToDonatePackage(row: {
  id: string;
  code: string;
  name: string;
  slug: string;
  description: string | null;
  suggested_amount_minor: number | null;
  currency: string | null;
  status: "active" | "hidden" | "archived";
  metadata: Record<string, unknown> | null;
}): DonatePackageSummary {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    slug: row.slug,
    description: row.description ?? "",
    suggestedAmountMinor: row.suggested_amount_minor ?? null,
    currency: row.currency,
    status: row.status,
    metadata: row.metadata ?? {}
  };
}

export class InMemoryDonatePackageRepository implements DonatePackageRepository {
  async list(): Promise<DonatePackageSummary[]> {
    return [...packages];
  }

  async findBySlug(slug: string): Promise<DonatePackageSummary | null> {
    return packages.find((pkg) => pkg.slug === slug) ?? null;
  }

  async findByCode(code: string): Promise<DonatePackageSummary | null> {
    return packages.find((pkg) => pkg.code === code) ?? null;
  }

  async save(pkg: DonatePackageSummary): Promise<DonatePackageSummary> {
    const index = packages.findIndex((entry) => entry.id === pkg.id);
    if (index >= 0) {
      packages[index] = pkg;
    } else {
      packages.push(pkg);
    }
    return pkg;
  }
}

class SupabaseDonatePackageRepository implements DonatePackageRepository {
  private client = getSupabaseServiceClient();

  async list(): Promise<DonatePackageSummary[]> {
    if (!this.client) {
      return new InMemoryDonatePackageRepository().list();
    }

    const { data, error } = await this.client
      .from("donate_packages")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      if (isMissingSupabaseTableError(error, "donate_packages")) {
        return new InMemoryDonatePackageRepository().list();
      }
      throw error;
    }

    return (data ?? []).map((row) => mapRowToDonatePackage(row as Parameters<typeof mapRowToDonatePackage>[0]));
  }

  async findBySlug(slug: string): Promise<DonatePackageSummary | null> {
    if (!this.client) {
      return new InMemoryDonatePackageRepository().findBySlug(slug);
    }

    const { data, error } = await this.client.from("donate_packages").select("*").eq("slug", slug).maybeSingle();
    if (error) {
      if (isMissingSupabaseTableError(error, "donate_packages")) {
        return new InMemoryDonatePackageRepository().findBySlug(slug);
      }
      throw error;
    }

    return data ? mapRowToDonatePackage(data as Parameters<typeof mapRowToDonatePackage>[0]) : null;
  }

  async findByCode(code: string): Promise<DonatePackageSummary | null> {
    if (!this.client) {
      return new InMemoryDonatePackageRepository().findByCode(code);
    }

    const { data, error } = await this.client.from("donate_packages").select("*").eq("code", code).maybeSingle();
    if (error) {
      if (isMissingSupabaseTableError(error, "donate_packages")) {
        return new InMemoryDonatePackageRepository().findByCode(code);
      }
      throw error;
    }

    return data ? mapRowToDonatePackage(data as Parameters<typeof mapRowToDonatePackage>[0]) : null;
  }

  async save(pkg: DonatePackageSummary): Promise<DonatePackageSummary> {
    if (!this.client) {
      throw new Error("PERSISTENCE_UNAVAILABLE: Supabase persistence is not configured.");
    }

    const { data, error } = await this.client
      .from("donate_packages")
      .upsert({
        id: pkg.id,
        code: pkg.code,
        name: pkg.name,
        slug: pkg.slug,
        description: pkg.description,
        suggested_amount_minor: pkg.suggestedAmountMinor,
        currency: pkg.currency,
        status: pkg.status,
        metadata: pkg.metadata ?? {}
      })
      .select("*")
      .maybeSingle();

    if (error || !data) {
      throw new Error(
        `PERSISTENCE_UNAVAILABLE: Failed to save donate package. ${error?.message ?? "Supabase did not return updated data."}`
      );
    }

    return mapRowToDonatePackage(data as Parameters<typeof mapRowToDonatePackage>[0]);
  }
}

export function createDonatePackageRepository() {
  if (hasSupabasePersistence()) {
    return new SupabaseDonatePackageRepository();
  }
  return new InMemoryDonatePackageRepository();
}
