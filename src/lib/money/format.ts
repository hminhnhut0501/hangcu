export type SupportedCurrency = "VND" | "USD";
export type MoneyLocale = "vi" | "en";

export function formatAmountMinor(amountMinor: number | null | undefined, currency: string | null | undefined, locale: MoneyLocale) {
  if (amountMinor == null || currency == null) {
    return null;
  }

  const normalizedCurrency = currency.toUpperCase();
  if (normalizedCurrency === "VND") {
    return locale === "vi"
      ? `${new Intl.NumberFormat("vi-VN").format(amountMinor)}đ`
      : `${new Intl.NumberFormat("en-US").format(amountMinor)} VND`;
  }

  return `${new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amountMinor / 100)} ${normalizedCurrency}`;
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
      ? `${new Intl.NumberFormat("vi-VN").format(amount)}đ`
      : `${new Intl.NumberFormat("en-US").format(amount)} VND`;
  }

  return `${new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount)} ${normalizedCurrency}`;
}

export function getPrimaryStoreCurrency(locale: MoneyLocale): SupportedCurrency {
  return locale === "vi" ? "VND" : "USD";
}

export function supportsUsdGateway(currency: string | null | undefined) {
  return String(currency ?? "").toUpperCase() === "USD";
}
