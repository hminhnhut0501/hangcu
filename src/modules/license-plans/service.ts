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
  slug?: string;
  description?: string;
  currencyPrices?: {
    VND: number | null;
    USD: number | null;
  };
  planType?: "regular" | "donate_bonus" | "special";
  durationDays?: number;
  isLifetime?: boolean;
  status?: "active" | "hidden" | "archived";
  sortOrder?: number;
  entitlementTags?: string[];
  vipGroupIds?: string[];
}) {
  const existing = await getLicensePlanById(input.id);
  const vipGroupIds = Array.isArray(input.vipGroupIds)
    ? input.vipGroupIds.map((value) => String(value).trim()).filter(Boolean)
    : undefined;
  const existingVipGroupPolicy = existing?.metadata?.vipGroupPolicy as { groupIds?: unknown[] } | undefined;
  const existingVipGroupIds = Array.isArray(existingVipGroupPolicy?.groupIds)
    ? existingVipGroupPolicy.groupIds.map((value) => String(value).trim()).filter(Boolean)
    : [];
  const vipGroupPolicy =
    vipGroupIds !== undefined
      ? { ...(existingVipGroupPolicy ?? {}), groupIds: vipGroupIds }
      : existingVipGroupIds.length > 0
        ? { ...(existingVipGroupPolicy ?? {}), groupIds: existingVipGroupIds }
        : undefined;
  return repository.save({
    id: input.id,
    code: input.code,
    name: input.name,
    nameVi: input.nameVi ?? input.name,
    nameEn: input.nameEn ?? input.name,
    slug: input.slug ?? existing?.slug ?? input.code.toLowerCase(),
    description: input.description ?? existing?.description ?? "",
    currencyPrices: input.currencyPrices ?? { VND: null, USD: null },
    planType: input.planType ?? existing?.planType ?? "regular",
    durationDays: input.durationDays ?? existing?.durationDays ?? 30,
    isLifetime: input.isLifetime ?? existing?.isLifetime ?? false,
    status: input.status ?? existing?.status ?? "active",
    sortOrder: input.sortOrder ?? existing?.sortOrder ?? 1,
    entitlementTags: input.entitlementTags ?? existing?.entitlementTags ?? ["app_access"],
    metadata: {
      ...(existing?.metadata ?? {}),
      ...(vipGroupPolicy ? { vipGroupPolicy } : {})
    }
  });
}

export async function deleteLicensePlan(id: string) {
  return repository.delete(id);
}
