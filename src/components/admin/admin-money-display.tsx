import { MoneyAmount } from "@/components/money/money-amount";

type Props = {
  amount: number | null | undefined;
  currency: string | null | undefined;
  locale: "vi" | "en";
  kind?: "minor" | "catalog";
  className?: string;
  fallback?: string;
};

export function AdminMoneyDisplay({ amount, currency, locale, kind = "minor", className = "", fallback = "-" }: Props) {
  return <MoneyAmount amount={amount} currency={currency} locale={locale} kind={kind} className={className} fallback={fallback} />;
}
