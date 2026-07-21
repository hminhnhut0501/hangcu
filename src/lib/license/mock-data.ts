import type { LicensePlanSummary } from "@/modules/license-plans/types";
import type { DonatePackageSummary } from "@/modules/donate-packages/types";
import type { ProductLicenseRuleSummary } from "@/modules/product-license-rules/types";

export const licensePlansSeed: LicensePlanSummary[] = [
  {
    id: "lp_30d",
    code: "HCV_30D",
    name: "30-Day License",
    nameVi: "License 30 ngày",
    nameEn: "30-Day License",
    slug: "30-day-license",
    description: "Temporary access for 30 days.",
    currencyPrices: {
      VND: 199000,
      USD: 9.99
    },
    planType: "regular",
    durationDays: 30,
    isLifetime: false,
    status: "active",
    sortOrder: 1,
    entitlementTags: ["app_access", "vip_group_access"],
    metadata: {}
  },
  {
    id: "lp_life",
    code: "HCV_LIFETIME",
    name: "Lifetime License",
    nameVi: "License trọn đời",
    nameEn: "Lifetime License",
    slug: "lifetime-license",
    description: "Permanent access for lifetime purchasers.",
    currencyPrices: {
      VND: 699000,
      USD: 29.99
    },
    planType: "regular",
    durationDays: 0,
    isLifetime: true,
    status: "active",
    sortOrder: 2,
    entitlementTags: ["app_access", "vip_group_access"],
    metadata: {}
  }
];

export const donatePackagesSeed: DonatePackageSummary[] = [
  {
    id: "dp_support_30",
    code: "DONATE_30",
    name: "Support Package - 30 Days",
    slug: "support-package-30-days",
    description: "A donate package that includes a 30-day license bonus.",
    suggestedAmountMinor: 2000,
    currency: "USD",
    status: "active",
    metadata: {}
  },
  {
    id: "dp_support_life",
    code: "DONATE_LIFE",
    name: "Support Package - Lifetime",
    slug: "support-package-lifetime",
    description: "A donate package that includes a lifetime license bonus.",
    suggestedAmountMinor: 5000,
    currency: "USD",
    status: "active",
    metadata: {}
  }
];

export const productLicenseRulesSeed: ProductLicenseRuleSummary[] = [
  {
    id: "plr_30d_skyline",
    productId: "prd_skyline",
    licensePlanId: "lp_30d",
    quantity: 1,
    isActive: true,
    startsAt: null,
    endsAt: null
  },
  {
    id: "plr_life_calm",
    productId: "prd_calm",
    licensePlanId: "lp_life",
    quantity: 1,
    isActive: true,
    startsAt: null,
    endsAt: null
  }
];
