import { licensePlansSeed } from "@/lib/license/mock-data";
import type { LicensePlanSummary } from "./types";

const plans: LicensePlanSummary[] = [...licensePlansSeed];

export interface LicensePlanRepository {
  list(): Promise<LicensePlanSummary[]>;
  findBySlug(slug: string): Promise<LicensePlanSummary | null>;
  findByCode(code: string): Promise<LicensePlanSummary | null>;
  save(plan: LicensePlanSummary): Promise<LicensePlanSummary>;
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
}

export function createLicensePlanRepository() {
  return new InMemoryLicensePlanRepository();
}
