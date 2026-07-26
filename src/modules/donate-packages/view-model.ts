import type { DonatePackageSummary } from "./types";
import { formatAmountMinor } from "@/lib/money/format";

export type Locale = "vi" | "en";

export type SupportPackageViewModel = {
  slug: string;
  code: string;
  name: string;
  description: string;
  amountMinor: number | null;
  currency: string | null;
  currencyPrices: {
    VND: number | null;
    USD: number | null;
  };
  badge?: string;
};

export function formatMoney(amountMinor: number | null, currency: string | null, locale: Locale) {
  return formatAmountMinor(amountMinor, currency, locale);
}

export function mapDonatePackageToViewModel(pkg: DonatePackageSummary, locale: Locale): SupportPackageViewModel {
  const selectedCurrency = locale === "vi" ? "VND" : "USD";
  return {
    slug: pkg.slug,
    code: pkg.code,
    name: pkg.name,
    description: pkg.description,
    amountMinor: pkg.currencyPrices[selectedCurrency],
    currency: selectedCurrency,
    currencyPrices: pkg.currencyPrices,
    badge: pkg.code
  };
}
