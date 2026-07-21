import { donatePackagesSeed } from "@/lib/license/mock-data";
import type { DonatePackageSummary } from "./types";

const packages: DonatePackageSummary[] = [...donatePackagesSeed];

export interface DonatePackageRepository {
  list(): Promise<DonatePackageSummary[]>;
  findBySlug(slug: string): Promise<DonatePackageSummary | null>;
  findByCode(code: string): Promise<DonatePackageSummary | null>;
  save(pkg: DonatePackageSummary): Promise<DonatePackageSummary>;
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

export function createDonatePackageRepository() {
  return new InMemoryDonatePackageRepository();
}
