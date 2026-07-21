export type LicensePlanSummary = {
  id: string;
  code: string;
  name: string;
  nameVi: string;
  nameEn: string;
  slug: string;
  description: string;
  currencyPrices: {
    VND: number | null;
    USD: number | null;
  };
  planType: "regular" | "donate_bonus" | "special";
  durationDays: number;
  isLifetime: boolean;
  status: "active" | "hidden" | "archived";
  sortOrder: number;
  entitlementTags: string[];
  metadata: Record<string, unknown>;
};
