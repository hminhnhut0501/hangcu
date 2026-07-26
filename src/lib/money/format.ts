export type SupportedCurrency = "VND" | "USD";
export type MoneyLocale = "vi" | "en";

export function formatCurrencyLabel(currency: string | null | undefined, locale: MoneyLocale) {
  const normalizedCurrency = String(currency ?? "").toUpperCase();
  if (normalizedCurrency === "VND") {
    return locale === "vi" ? "VNĐ" : "VND";
  }

  if (normalizedCurrency === "USD") {
    return "USD";
  }

  return normalizedCurrency || null;
}

export function formatAmountMinor(amountMinor: number | null | undefined, currency: string | null | undefined, locale: MoneyLocale) {
  if (amountMinor == null || currency == null) {
    return null;
  }

  const normalizedCurrency = currency.toUpperCase();
  if (normalizedCurrency === "VND") {
    return locale === "vi"
      ? `${new Intl.NumberFormat("vi-VN").format(amountMinor)} ${formatCurrencyLabel("VND", locale)}`
      : `${new Intl.NumberFormat("en-US").format(amountMinor)} ${formatCurrencyLabel("VND", locale)}`;
  }

  return `${new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amountMinor / 100)} ${formatCurrencyLabel(normalizedCurrency, locale)}`;
}

export function formatCurrencyAmount(amountMinor: number, currency: string, locale: MoneyLocale) {
  return formatAmountMinor(amountMinor, currency, locale) ?? "-";
}

export function formatCatalogPrice(amount: number | null | undefined, currency: string | null | undefined, locale: MoneyLocale) {
  if (amount == null || currency == null) {
    return null;
  }

  const normalizedCurrency = currency.toUpperCase();
  if (normalizedCurrency === "VND") {
    return locale === "vi"
      ? `${new Intl.NumberFormat("vi-VN").format(amount)} ${formatCurrencyLabel("VND", locale)}`
      : `${new Intl.NumberFormat("en-US").format(amount)} ${formatCurrencyLabel("VND", locale)}`;
  }

  return `${new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount)} ${formatCurrencyLabel(normalizedCurrency, locale)}`;
}

export function getPrimaryStoreCurrency(locale: MoneyLocale): SupportedCurrency {
  return locale === "vi" ? "VND" : "USD";
}

export function supportsUsdGateway(currency: string | null | undefined) {
  return String(currency ?? "").toUpperCase() === "USD";
}
