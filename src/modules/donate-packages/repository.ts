import { donatePackagesSeed } from "@/lib/license/mock-data";
import { getSupabaseServiceClient } from "@/lib/db/supabase-server";
import { hasSupabasePersistence } from "@/lib/db/persistence";
import { isMissingSupabaseTableError } from "@/lib/db/supabase-errors";
import type { DonatePackageSummary } from "./types";

const packages: DonatePackageSummary[] = [...donatePackagesSeed];

export interface DonatePackageRepository {
  list(): Promise<DonatePackageSummary[]>;
  findById(id: string): Promise<DonatePackageSummary | null>;
  findBySlug(slug: string): Promise<DonatePackageSummary | null>;
  findByCode(code: string): Promise<DonatePackageSummary | null>;
  save(pkg: DonatePackageSummary): Promise<DonatePackageSummary>;
  delete(id: string): Promise<boolean>;
}

function mapRowToDonatePackage(row: {
  id: string;
  code: string;
  name: string;
  slug: string;
  description: string | null;
  suggested_amount_minor: number | null;
  currency: string | null;
  vnd_amount_minor?: number | null;
  usd_amount_minor?: number | null;
  status: "active" | "hidden" | "archived";
  metadata: Record<string, unknown> | null;
}): DonatePackageSummary {
  const metadata = row.metadata ?? {};
  const rawPrices = (metadata.currencyPrices ?? metadata.currency_prices ?? {}) as {
    VND?: number | null;
    USD?: number | null;
  };
  const vndAmountMinor =
    typeof row.vnd_amount_minor === "number"
      ? row.vnd_amount_minor
      : typeof rawPrices.VND === "number"
        ? rawPrices.VND
        : row.currency?.toUpperCase() === "VND"
          ? row.suggested_amount_minor
          : null;
  const usdAmountMinor =
    typeof row.usd_amount_minor === "number"
      ? row.usd_amount_minor
      : typeof rawPrices.USD === "number"
        ? rawPrices.USD
        : row.currency?.toUpperCase() === "USD"
          ? row.suggested_amount_minor
          : null;
  const fallbackCurrency = row.currency?.toUpperCase() === "USD" ? "USD" : "VND";
  const fallbackAmount = row.suggested_amount_minor ?? vndAmountMinor ?? usdAmountMinor ?? null;
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    slug: row.slug,
    description: row.description ?? "",
    suggestedAmountMinor: fallbackAmount,
    currency: row.currency,
    vndAmountMinor,
    usdAmountMinor,
    currencyPrices: {
      VND: vndAmountMinor ?? (fallbackCurrency === "VND" ? fallbackAmount : null),
      USD: usdAmountMinor ?? (fallbackCurrency === "USD" ? fallbackAmount : null)
    },
    status: row.status,
    metadata
  };
}

export class InMemoryDonatePackageRepository implements DonatePackageRepository {
  async list(): Promise<DonatePackageSummary[]> {
    return [...packages];
  }

  async findById(id: string): Promise<DonatePackageSummary | null> {
    return packages.find((pkg) => pkg.id === id) ?? null;
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

  async delete(id: string): Promise<boolean> {
    const index = packages.findIndex((entry) => entry.id === id);
    if (index < 0) return false;
    packages.splice(index, 1);
    return true;
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

  async findById(id: string): Promise<DonatePackageSummary | null> {
    if (!this.client) {
      return new InMemoryDonatePackageRepository().findById(id);
    }

    const { data, error } = await this.client.from("donate_packages").select("*").eq("id", id).maybeSingle();
    if (error) {
      if (isMissingSupabaseTableError(error, "donate_packages")) {
        return new InMemoryDonatePackageRepository().findById(id);
      }
      throw error;
    }

    return data ? mapRowToDonatePackage(data as Parameters<typeof mapRowToDonatePackage>[0]) : null;
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
        vnd_amount_minor: pkg.vndAmountMinor,
        usd_amount_minor: pkg.usdAmountMinor,
        status: pkg.status,
        metadata: {
          ...(pkg.metadata ?? {}),
          currencyPrices: {
            VND: pkg.vndAmountMinor,
            USD: pkg.usdAmountMinor
          }
        }
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

  async delete(id: string): Promise<boolean> {
    if (!this.client) {
      throw new Error("PERSISTENCE_UNAVAILABLE: Supabase persistence is not configured.");
    }

    const { error } = await this.client.from("donate_packages").delete().eq("id", id);
    if (error) {
      throw new Error(`PERSISTENCE_UNAVAILABLE: Failed to delete donate package. ${error.message}`);
    }

    return true;
  }
}

export function createDonatePackageRepository() {
  if (hasSupabasePersistence()) {
    return new SupabaseDonatePackageRepository();
  }
  return new InMemoryDonatePackageRepository();
}
