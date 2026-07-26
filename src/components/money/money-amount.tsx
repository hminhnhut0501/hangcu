"use client";

import { formatAmountMinor, formatCatalogPrice, formatCurrencyLabel, type MoneyLocale } from "@/lib/money/format";

type MoneyAmountProps = {
  amount: number | null | undefined;
  currency: string | null | undefined;
  locale: MoneyLocale;
  kind?: "minor" | "catalog";
  className?: string;
  amountClassName?: string;
  labelClassName?: string;
  showLabel?: boolean;
  fallback?: string;
};

export function MoneyAmount({
  amount,
  currency,
  locale,
  kind = "minor",
  className = "",
  amountClassName = "",
  labelClassName = "",
  showLabel = true,
  fallback = "-"
}: MoneyAmountProps) {
  const formatted =
    kind === "catalog" ? formatCatalogPrice(amount, currency, locale) : formatAmountMinor(amount, currency, locale);
  const label = formatCurrencyLabel(currency, locale);

  if (!formatted) {
    return <span className={className}>{fallback}</span>;
  }

  if (!showLabel || !label) {
    return <span className={className}>{formatted}</span>;
  }

  const currencyIndex = formatted.lastIndexOf(" ");
  const amountText = currencyIndex > 0 ? formatted.slice(0, currencyIndex) : formatted;

  return (
    <span className={`inline-flex items-baseline gap-1 ${className}`.trim()}>
      <span className={amountClassName}>{amountText}</span>
      <span className={labelClassName}>{currencyIndex > 0 ? formatted.slice(currencyIndex + 1) : label}</span>
    </span>
  );
}
