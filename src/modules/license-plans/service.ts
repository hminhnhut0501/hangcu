import { LicensePlanNotFoundError } from "./errors";
import { createLicensePlanRepository } from "./repository";

const repository = createLicensePlanRepository();

export async function listLicensePlans() {
  return repository.list();
}

export async function getLicensePlanBySlug(slug: string) {
  const plan = await repository.findBySlug(slug);
  if (!plan) {
    throw new LicensePlanNotFoundError();
  }
  return plan;
}

export async function getLicensePlanByCode(code: string) {
  return repository.findByCode(code);
}

export async function getLicensePlanById(id: string) {
  const plans = await repository.list();
  return plans.find((plan) => plan.id === id) ?? null;
}

export async function upsertLicensePlan(input: {
  id: string;
  code: string;
  name: string;
  nameVi?: string;
  nameEn?: string;
  slug: string;
  description: string;
  currencyPrices?: {
    VND: number | null;
    USD: number | null;
  };
  planType: "regular" | "donate_bonus" | "special";
  durationDays: number;
  isLifetime: boolean;
  status: "active" | "hidden" | "archived";
  sortOrder: number;
  entitlementTags?: string[];
}) {
  return repository.save({
    ...input,
    nameVi: input.nameVi ?? input.name,
    nameEn: input.nameEn ?? input.name,
    currencyPrices: input.currencyPrices ?? { VND: null, USD: null },
    entitlementTags: input.entitlementTags ?? ["app_access"],
    metadata: {}
  });
}
