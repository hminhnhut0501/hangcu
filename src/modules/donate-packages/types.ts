export type DonatePackageSummary = {
  id: string;
  code: string;
  name: string;
  slug: string;
  description: string;
  suggestedAmountMinor: number | null;
  currency: string | null;
  vndAmountMinor: number | null;
  usdAmountMinor: number | null;
  currencyPrices: {
    VND: number | null;
    USD: number | null;
  };
  status: "active" | "hidden" | "archived";
  metadata: Record<string, unknown>;
};
