"use client";

import React, { useMemo, useState } from "react";
import { BadgeCheck, ChevronRight, CreditCard, Sparkles, Wallet } from "lucide-react";
import { MoneyAmount } from "@/components/money/money-amount";

type CheckoutOption = {
  slug: string;
  code: string;
  kind: "license" | "support";
  name: string;
  description: string;
  amountMinor: number;
  currency: string;
};

type PaymentGateway = {
  provider: "payos" | "paypal" | "lemonsqueezy" | "creem" | "sandbox" | "manual";
  labelVi: string;
  labelEn: string;
  currencies: Array<"VND" | "USD">;
  visible: boolean;
};

type Props = {
  locale: "vi" | "en";
  licenseOptions: CheckoutOption[];
  supportOptions: CheckoutOption[];
  paymentGateways: PaymentGateway[];
  initialSelectedSlug?: string;
  initialMode?: "license" | "support" | "custom";
  initialEmail?: string;
  orderSummary: {
    orderNumber?: string | null;
    checkoutId?: string | null;
    planCode?: string | null;
    planLabel?: string | null;
    amountLabel?: string | null;
    customerRef?: string | null;
    amountMinor?: number | null;
    currency?: string | null;
  };
};

function ChipButton({
  active,
  label,
  onClick,
  className = ""
}: {
  active: boolean;
  label: string;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center justify-center rounded-full border px-4 py-2 text-sm font-medium transition ${
        active ? "border-slate-950 bg-slate-950 text-white shadow-sm" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-950"
      } ${className}`}
    >
      {label}
    </button>
  );
}

function CompactRow({
  label,
  value
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-3 py-2.5">
      <p className="text-xs font-medium uppercase tracking-[0.22em] text-slate-500">{label}</p>
      <div className="text-right text-sm font-medium text-slate-950">{value}</div>
    </div>
  );
}

function formatMoneyAmount(amountMinor: number, currency: string, locale: "vi" | "en") {
  const amount = currency === "USD" ? amountMinor / 100 : amountMinor;
  const formatted = new Intl.NumberFormat(locale === "vi" ? "vi-VN" : "en-US", {
    maximumFractionDigits: currency === "USD" ? 2 : 0,
    minimumFractionDigits: currency === "USD" ? 2 : 0
  }).format(amount);
  return currency === "USD" ? `${formatted} USD` : `${formatted} VNĐ`;
}

export function CheckoutPaymentForm({
  locale,
  licenseOptions,
  supportOptions,
  paymentGateways,
  initialSelectedSlug,
  initialMode,
  initialEmail,
  orderSummary
}: Props) {
  const [provider, setProvider] = useState<"payos" | "paypal" | "lemonsqueezy" | "creem" | "sandbox" | "manual">("payos");
  const [mode, setMode] = useState<"license" | "support" | "custom">(
    initialMode ?? (supportOptions.some((option) => option.slug === initialSelectedSlug) ? "support" : "license")
  );
  const [selectedSlug, setSelectedSlug] = useState(initialSelectedSlug ?? licenseOptions[0]?.slug ?? supportOptions[0]?.slug ?? "");
  const [email, setEmail] = useState(initialEmail ?? "");
  const [customAmount, setCustomAmount] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const selectedOption =
    [...licenseOptions, ...supportOptions].find((option) => option.slug === selectedSlug) ??
    licenseOptions[0] ??
    supportOptions[0] ??
    null;
  const selectedLicense = licenseOptions.find((option) => option.slug === selectedSlug) ?? licenseOptions[0] ?? null;
  const selectedSupport = supportOptions.find((option) => option.slug === selectedSlug) ?? supportOptions[0] ?? null;
  const isSupportOption = selectedOption?.kind === "support";
  const currentCurrency: "VND" | "USD" = mode === "custom" ? "VND" : selectedOption?.currency?.toUpperCase() === "USD" ? "USD" : "VND";
  const gateways = useMemo(
    () => paymentGateways.filter((gateway) => gateway.visible && gateway.currencies.includes(currentCurrency)),
    [currentCurrency, paymentGateways]
  );
  const visibleGateways = mode === "custom" ? gateways.filter((gateway) => gateway.provider !== "creem") : gateways;

  React.useEffect(() => {
    if (visibleGateways.some((gateway) => gateway.provider === provider)) return;
    const preferred =
      currentCurrency === "USD"
        ? visibleGateways.find((gateway) => gateway.provider === "creem") ??
          visibleGateways.find((gateway) => gateway.provider === "paypal") ??
          visibleGateways[0]
        : visibleGateways.find((gateway) => gateway.provider === "payos") ?? visibleGateways[0];
    if (preferred) setProvider(preferred.provider);
  }, [currentCurrency, provider, visibleGateways]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      if (mode !== "custom" && !selectedOption) {
        throw new Error(locale === "vi" ? "Vui lòng chọn một gói." : "Please choose a package.");
      }
      if (!email.trim()) {
        throw new Error(locale === "vi" ? "Vui lòng nhập email." : "Please enter your email.");
      }

      const customAmountMinor = mode === "custom" || isSupportOption ? Number(customAmount) : null;
      if ((mode === "custom" || isSupportOption) && (customAmountMinor == null || !Number.isFinite(customAmountMinor) || customAmountMinor <= 0)) {
        throw new Error(locale === "vi" ? "Vui lòng nhập số tiền hợp lệ." : "Please enter a valid amount.");
      }

      const payload: Record<string, string> = { provider, email };

      if (mode === "license" && selectedLicense) {
        payload.planCode = selectedLicense.code;
        payload.plan = selectedLicense.name;
        payload.amountMinor = String(selectedLicense.amountMinor);
        payload.currency = selectedLicense.currency;
      }

      if (mode === "support" && selectedSupport) {
        payload.planCode = selectedSupport.code;
        payload.plan = selectedSupport.name;
        payload.amountMinor = String(Math.round(customAmountMinor ?? selectedSupport.amountMinor));
        payload.currency = selectedSupport.currency;
      }

      if (mode === "custom") {
        payload.plan = locale === "vi" ? "Ủng hộ tự do" : "Flexible support";
        payload.amountMinor = String(Math.round(customAmountMinor ?? 0));
        payload.currency = "VND";
      }

      if (orderSummary.orderNumber) payload.orderNumber = orderSummary.orderNumber;
      if (orderSummary.checkoutId) payload.checkoutId = orderSummary.checkoutId;
      if (!orderSummary.planCode && orderSummary.planLabel) payload.plan = orderSummary.planLabel;
      if (orderSummary.amountLabel) payload.amountLabel = orderSummary.amountLabel;
      if (orderSummary.customerRef) payload.customerRef = orderSummary.customerRef;
      if (typeof orderSummary.amountMinor === "number") payload.amountMinor = String(orderSummary.amountMinor);
      if (orderSummary.currency) payload.currency = orderSummary.currency;

      const response = await fetch("/api/checkout/pay", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload)
      });
      const json = (await response.json().catch(() => null)) as { success?: boolean; data?: { checkoutUrl?: string }; error?: { message?: string } } | null;
      if (!response.ok || !json?.success || !json.data?.checkoutUrl) {
        throw new Error(json?.error?.message ?? "Unable to create checkout");
      }
      window.location.href = json.data.checkoutUrl;
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to create checkout");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="overflow-hidden rounded-[2.25rem] border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.06)]">
      <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_16rem]">
        <div className="space-y-5 px-5 py-5 sm:px-6 sm:py-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">{locale === "vi" ? "Bước 1" : "Step 1"}</p>
                <h3 className="mt-2 text-sm font-semibold text-slate-950">{locale === "vi" ? "Chọn kiểu thanh toán" : "Choose payment type"}</h3>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <ChipButton active={mode === "license"} label={locale === "vi" ? "License" : "License"} onClick={() => setMode("license")} />
              <ChipButton active={mode === "support"} label={locale === "vi" ? "Ủng hộ" : "Support"} onClick={() => setMode("support")} />
              <ChipButton active={mode === "custom"} label={locale === "vi" ? "Tự nhập" : "Custom"} onClick={() => setMode("custom")} />
            </div>
          </div>

          {mode === "license" ? (
            <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-4 sm:p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">{locale === "vi" ? "Bước 2" : "Step 2"}</p>
                  <h3 className="mt-2 text-sm font-semibold text-slate-950">{locale === "vi" ? "Chọn gói" : "Choose a plan"}</h3>
                </div>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-500 ring-1 ring-slate-200">{licenseOptions.length}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {licenseOptions.map((option) => (
                  <ChipButton
                    key={option.slug}
                    active={selectedSlug === option.slug}
                    label={`${option.name} · ${formatMoneyAmount(option.amountMinor, option.currency, locale)}`}
                    onClick={() => {
                      setSelectedSlug(option.slug);
                      setCustomAmount("");
                    }}
                  />
                ))}
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-600">{licenseOptions.find((option) => option.slug === selectedSlug)?.description ?? ""}</p>
            </div>
          ) : null}

          {mode === "support" ? (
            <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-4 sm:p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">{locale === "vi" ? "Bước 2" : "Step 2"}</p>
                  <h3 className="mt-2 text-sm font-semibold text-slate-950">{locale === "vi" ? "Chọn mức" : "Choose a tier"}</h3>
                </div>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-500 ring-1 ring-slate-200">{supportOptions.length}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {supportOptions.map((option) => (
                  <ChipButton
                    key={option.slug}
                    active={selectedSlug === option.slug}
                    label={`${option.name} · ${formatMoneyAmount(option.amountMinor, option.currency, locale)}`}
                    onClick={() => {
                      setSelectedSlug(option.slug);
                      setCustomAmount(String(option.amountMinor));
                    }}
                  />
                ))}
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-600">{supportOptions.find((option) => option.slug === selectedSlug)?.description ?? ""}</p>
            </div>
          ) : null}

          {mode === "custom" ? (
            <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-4 sm:p-5">
              <div className="mb-4">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">{locale === "vi" ? "Bước 2" : "Step 2"}</p>
                <h3 className="mt-2 text-sm font-semibold text-slate-950">{locale === "vi" ? "Nhập số tiền" : "Enter amount"}</h3>
              </div>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">{locale === "vi" ? "Tiền" : "Amount"}</span>
                <input
                  type="number"
                  min="1"
                  value={customAmount}
                  onChange={(event) => setCustomAmount(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none ring-0 focus:border-blue-500"
                  placeholder={locale === "vi" ? "Nhập số tiền" : "Enter amount"}
                />
              </label>
            </div>
          ) : null}

          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">{locale === "vi" ? "Bước 3" : "Step 3"}</p>
                <h3 className="mt-2 text-sm font-semibold text-slate-950">{locale === "vi" ? "Nhập email" : "Email"}</h3>
              </div>
              <span className="rounded-full bg-slate-50 px-3 py-1 text-xs font-medium text-slate-500 ring-1 ring-slate-200">{locale === "vi" ? "Gửi key" : "Receipt"}</span>
            </div>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-4 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none ring-0 focus:border-blue-500"
              placeholder={locale === "vi" ? "Email nhận license" : "Receipt email"}
            />
          </div>

          <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">{locale === "vi" ? "Bước 4" : "Step 4"}</p>
                <h3 className="mt-2 text-sm font-semibold text-slate-950">{locale === "vi" ? "Cổng thanh toán" : "Gateway"}</h3>
              </div>
              <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-500 ring-1 ring-slate-200">{currentCurrency}</span>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {visibleGateways.length > 0 ? (
                visibleGateways.map((gateway) => (
                  <ChipButton
                    key={gateway.provider}
                    active={gateway.provider === provider}
                    label={locale === "vi" ? gateway.labelVi : gateway.labelEn}
                    onClick={() => setProvider(gateway.provider)}
                    className="px-3"
                  />
                ))
              ) : (
                <p className="text-sm text-slate-500">{locale === "vi" ? "Chưa có cổng thanh toán phù hợp." : "No matching gateways available."}</p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-50"
            >
              {loading ? (locale === "vi" ? "Đang chuyển..." : "Redirecting...") : locale === "vi" ? "Thanh toán ngay" : "Continue to payment"}
              <ChevronRight className="h-4 w-4" />
            </button>
            <p className="text-sm text-slate-500">{locale === "vi" ? "Tự khớp theo tiền tệ." : "Auto-matched by currency."}</p>
          </div>

          {message ? <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{message}</p> : null}
        </div>

        <aside className="border-t border-slate-200 bg-slate-50 p-5 lg:sticky lg:top-6 lg:self-start lg:border-l lg:border-t-0 lg:bg-white">
          <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">{locale === "vi" ? "Tóm tắt" : "Summary"}</p>
            <div className="mt-3 space-y-2">
              <CompactRow label={locale === "vi" ? "Gói" : "Plan"} value={selectedOption?.name ?? "-"} />
              <CompactRow
                label={locale === "vi" ? "Giá" : "Price"}
                value={selectedOption ? <MoneyAmount amount={selectedOption.amountMinor} currency={selectedOption.currency} locale={locale} /> : "-"}
              />
              <CompactRow
                label={locale === "vi" ? "Cổng" : "Gateway"}
                value={locale === "vi" ? paymentGateways.find((item) => item.provider === provider)?.labelVi ?? provider : paymentGateways.find((item) => item.provider === provider)?.labelEn ?? provider}
              />
            </div>
          </div>

          {orderSummary.orderNumber || orderSummary.checkoutId || orderSummary.customerRef ? (
            <div className="mt-3 rounded-[1.5rem] border border-blue-200 bg-blue-50 p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blue-500">{locale === "vi" ? "Bot" : "Bot"}</p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs text-blue-900">
                {orderSummary.orderNumber ? <span className="rounded-full bg-white px-3 py-1 ring-1 ring-blue-100">#{orderSummary.orderNumber}</span> : null}
                {orderSummary.checkoutId ? <span className="rounded-full bg-white px-3 py-1 ring-1 ring-blue-100">{orderSummary.checkoutId}</span> : null}
              </div>
            </div>
          ) : null}
        </aside>
      </div>
    </form>
  );
}
