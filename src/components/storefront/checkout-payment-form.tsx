"use client";

import React, { useState } from "react";
import { ArrowRight, BadgeCheck, CreditCard, Sparkles, Wallet } from "lucide-react";
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
  provider: "payos" | "paypal" | "lemonsqueezy" | "sandbox" | "manual";
  labelVi: string;
  labelEn: string;
  currencies: Array<"VND" | "USD">;
  visible: boolean;
};

function StepIcon({ active, children }: { active?: boolean; children: React.ReactNode }) {
  return (
    <span
      className={`flex h-10 w-10 items-center justify-center rounded-2xl ${
        active ? "bg-slate-950 text-white" : "bg-slate-100 text-slate-700"
      }`}
    >
      {children}
    </span>
  );
}

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
  const [provider, setProvider] = useState<"payos" | "paypal" | "lemonsqueezy" | "sandbox" | "manual">("payos");
  const [mode, setMode] = useState<"license" | "support" | "custom">(initialMode ?? (supportOptions.some((option) => option.slug === initialSelectedSlug) ? "support" : "license"));
  const [selectedSlug, setSelectedSlug] = useState(
    initialSelectedSlug ?? licenseOptions[0]?.slug ?? supportOptions[0]?.slug ?? ""
  );
  const [email, setEmail] = useState(initialEmail ?? "");
  const [customAmount, setCustomAmount] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const selectedOption =
    [...licenseOptions, ...supportOptions].find((option) => option.slug === selectedSlug) ??
    licenseOptions[0] ??
    supportOptions[0] ??
    null;
  const isSupportOption = selectedOption?.kind === "support";
  const activeLicenseOptions = licenseOptions;
  const activeSupportOptions = supportOptions;

  const selectedLicense = activeLicenseOptions.find((option) => option.slug === selectedSlug) ?? activeLicenseOptions[0] ?? null;
  const selectedSupport = activeSupportOptions.find((option) => option.slug === selectedSlug) ?? activeSupportOptions[0] ?? null;
  const selectedCurrency = mode === "custom" ? "VND" : selectedOption?.currency?.toUpperCase() ?? null;
  const currentCurrency: "VND" | "USD" = selectedCurrency === "USD" ? "USD" : "VND";
  const visibleGateways = paymentGateways.filter((gateway) => gateway.visible && gateway.currencies.includes(currentCurrency));
  const currentCurrencyLabel = currentCurrency === "VND" ? (locale === "vi" ? "VNĐ" : "VND") : "USD";
  const currencyTitle =
    currentCurrency === "VND"
      ? locale === "vi"
        ? "Cổng thanh toán cho VNĐ"
        : "Payment gateways for VND"
      : locale === "vi"
        ? "Cổng thanh toán cho USD"
        : "Payment gateways for USD";
  const currencyDescription =
    currentCurrency === "VND"
      ? locale === "vi"
        ? "Chỉ hiển thị các cổng nhận VNĐ cho gói đang chọn."
        : "Only VNĐ gateways are shown for the selected package."
      : locale === "vi"
        ? "Chỉ hiển thị các cổng nhận USD cho gói đang chọn."
        : "Only USD gateways are shown for the selected package.";

  React.useEffect(() => {
    if (visibleGateways.some((gateway) => gateway.provider === provider)) return;
    const preferred =
      currentCurrency === "USD"
        ? visibleGateways.find((gateway) => gateway.provider === "paypal") ?? visibleGateways[0]
        : visibleGateways.find((gateway) => gateway.provider === "payos") ?? visibleGateways[0];
    if (preferred) {
      setProvider(preferred.provider);
    }
  }, [currentCurrency, provider, visibleGateways]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    if (mode !== "custom" && !selectedOption) {
      setMessage(locale === "vi" ? "Vui lòng chọn một gói." : "Please choose a package.");
      setLoading(false);
      return;
    }
    if (!email.trim()) {
      setMessage(locale === "vi" ? "Vui lòng nhập email." : "Please enter your email.");
      setLoading(false);
      return;
    }
    const customAmountMinor = mode === "custom" ? Number(customAmount) : isSupportOption ? Number(customAmount) : null;
    if ((mode === "custom" || isSupportOption) && (customAmountMinor == null || !Number.isFinite(customAmountMinor) || customAmountMinor <= 0)) {
      setMessage(locale === "vi" ? "Vui lòng nhập số tiền ủng hộ hợp lệ." : "Please enter a valid support amount.");
      setLoading(false);
      return;
    }
    const payload: Record<string, string> = {
      provider,
      email
    };
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
    try {
      const response = await fetch("/api/checkout/pay", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload)
      });
      const json = (await response.json().catch(() => null)) as
        | { success?: boolean; data?: { checkoutUrl?: string }; error?: { message?: string } }
        | null;
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
    <form onSubmit={submit} className="space-y-5 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
      <div className="grid gap-4">
        <div className="grid gap-3 md:grid-cols-3">
          <button
            type="button"
            onClick={() => setMode("license")}
            className={`rounded-[1.5rem] border px-4 py-4 text-left transition ${
              mode === "license" ? "border-slate-950 bg-slate-950 text-white shadow-[0_16px_30px_rgba(15,23,42,0.12)]" : "border-slate-200 bg-white hover:border-slate-300"
            }`}
          >
            <div className="flex items-start gap-3">
              <StepIcon active={mode === "license"}>
                <BadgeCheck className="h-5 w-5" />
              </StepIcon>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] opacity-80">{locale === "vi" ? "Gói license" : "License pack"}</p>
                <p className="mt-1 text-sm font-semibold">{locale === "vi" ? "30 ngày / trọn đời" : "30-day / lifetime"}</p>
                <p className="mt-1 text-sm leading-6 opacity-80">
                  {locale === "vi" ? "Hai gói chính, chọn là đi tiếp." : "Two main plans, select and continue."}
                </p>
              </div>
            </div>
          </button>
          <button
            type="button"
            onClick={() => setMode("support")}
            className={`rounded-[1.5rem] border px-4 py-4 text-left transition ${
              mode === "support" ? "border-slate-950 bg-slate-950 text-white shadow-[0_16px_30px_rgba(15,23,42,0.12)]" : "border-slate-200 bg-white hover:border-slate-300"
            }`}
          >
            <div className="flex items-start gap-3">
              <StepIcon active={mode === "support"}>
                <Wallet className="h-5 w-5" />
              </StepIcon>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] opacity-80">{locale === "vi" ? "Gói support" : "Support pack"}</p>
                <p className="mt-1 text-sm font-semibold">{locale === "vi" ? "Mức gợi ý" : "Suggested amount"}</p>
                <p className="mt-1 text-sm leading-6 opacity-80">
                  {locale === "vi" ? "Chọn nhanh một mức ủng hộ." : "Pick one suggested contribution."}
                </p>
              </div>
            </div>
          </button>
          <button
            type="button"
            onClick={() => setMode("custom")}
            className={`rounded-[1.5rem] border px-4 py-4 text-left transition ${
              mode === "custom" ? "border-slate-950 bg-slate-950 text-white shadow-[0_16px_30px_rgba(15,23,42,0.12)]" : "border-slate-200 bg-white hover:border-slate-300"
            }`}
          >
            <div className="flex items-start gap-3">
              <StepIcon active={mode === "custom"}>
                <Sparkles className="h-5 w-5" />
              </StepIcon>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] opacity-80">{locale === "vi" ? "Ủng hộ tự do" : "Custom support"}</p>
                <p className="mt-1 text-sm font-semibold">{locale === "vi" ? "Tự nhập số tiền" : "Enter your own amount"}</p>
                <p className="mt-1 text-sm leading-6 opacity-80">
                  {locale === "vi" ? "Dành cho khoản ủng hộ linh hoạt." : "For a flexible contribution amount."}
                </p>
              </div>
            </div>
          </button>
        </div>

        <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-950">{currencyTitle}</p>
              <p className="mt-1 text-sm text-slate-600">{currencyDescription}</p>
            </div>
            <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-500 ring-1 ring-slate-200">
              {currentCurrencyLabel}
            </span>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {(["VND", "USD"] as const).map((currency) => {
              const gateways = paymentGateways.filter((gateway) => gateway.visible && gateway.currencies.includes(currency));
              const highlighted = currency === currentCurrency;
              return (
                <div
                  key={currency}
                  className={`rounded-[1.5rem] border p-4 transition ${
                    highlighted ? "border-slate-950 bg-white shadow-sm" : "border-slate-200 bg-white/80"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                        {locale === "vi" ? (currency === "VND" ? "VI / VNĐ" : "EN / USD") : currency === "VND" ? "VI / VND" : "EN / USD"}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-950">
                        {currency === "VND"
                          ? locale === "vi"
                            ? "Nhóm cổng cho VNĐ"
                            : "VND gateways"
                          : locale === "vi"
                            ? "Nhóm cổng cho USD"
                            : "USD gateways"}
                      </p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                      {gateways.length} {locale === "vi" ? "cổng" : "gateways"}
                    </span>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {gateways.length > 0 ? (
                      gateways.map((gateway) => (
                        <span
                          key={`${currency}-${gateway.provider}`}
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            highlighted && gateway.provider === provider ? "bg-slate-950 text-white" : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {locale === "vi" ? gateway.labelVi : gateway.labelEn}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-slate-500">{locale === "vi" ? "Chưa có cổng nào." : "No gateways available."}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {mode === "license" ? (
          <div className="space-y-3 rounded-[1.75rem] border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-slate-700">{locale === "vi" ? "Chọn license" : "Choose a license"}</p>
              <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-500 ring-1 ring-slate-200">
                {locale === "vi" ? "2 lựa chọn" : "2 options"}
              </span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {activeLicenseOptions.map((option) => (
                <button
                  key={option.slug}
                  type="button"
                  onClick={() => {
                    setSelectedSlug(option.slug);
                    setCustomAmount("");
                  }}
                  className={`rounded-[1.5rem] border px-4 py-4 text-left transition ${
                    selectedSlug === option.slug ? "border-slate-950 bg-white shadow-sm ring-1 ring-slate-950/10" : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-2">
                      <p className="text-xs font-medium uppercase tracking-[0.22em] text-slate-500">{option.code}</p>
                      <p className="text-base font-semibold text-slate-950">{option.name}</p>
                      <p className="text-sm leading-6 text-slate-600">{option.description}</p>
                    </div>
                    <span className="rounded-2xl bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-950">
                      <MoneyAmount amount={option.amountMinor} currency={option.currency} locale={locale} />
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {mode === "support" ? (
          <div className="space-y-3 rounded-[1.75rem] border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-slate-700">{locale === "vi" ? "Chọn gói support" : "Choose a support pack"}</p>
              <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-500 ring-1 ring-slate-200">
                {locale === "vi" ? "Gọn, nhanh" : "Compact"}
              </span>
            </div>
            <div className="grid gap-3">
              {activeSupportOptions.map((option) => (
                <button
                  key={option.slug}
                  type="button"
                  onClick={() => {
                    setSelectedSlug(option.slug);
                    setCustomAmount(String(option.amountMinor));
                  }}
                  className={`rounded-[1.35rem] border px-4 py-3 text-left transition ${
                    selectedSlug === option.slug ? "border-slate-950 bg-white shadow-sm ring-1 ring-slate-950/10" : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                    <p className="text-sm font-semibold text-slate-950">{option.name}</p>
                    <p className="mt-1 text-sm text-slate-600">{option.description}</p>
                  </div>
                  <span className="rounded-full bg-slate-950 px-3 py-1 text-sm font-semibold text-white">
                      <MoneyAmount amount={option.amountMinor} currency={option.currency} locale={locale} />
                  </span>
                </div>
              </button>
              ))}
            </div>
          </div>
        ) : null}

        {mode === "custom" ? (
          <label className="block">
            <span className="text-sm font-medium text-slate-700">{locale === "vi" ? "Số tiền ủng hộ" : "Support amount"}</span>
            <input
              type="number"
              min="1"
              step="1"
              value={customAmount}
              onChange={(event) => setCustomAmount(event.target.value)}
              placeholder={locale === "vi" ? "Nhập số tiền bạn muốn ủng hộ" : "Enter the amount you want to support"}
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
            />
            <p className="mt-2 text-xs text-slate-500">
              {locale === "vi" ? "Bạn tự nhập số tiền, không cần chọn gói." : "You enter the amount yourself, no preset package needed."}
            </p>
          </label>
        ) : null}

        <label className="block">
          <span className="text-sm font-medium text-slate-700">{locale === "vi" ? "Email" : "Email"}</span>
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder={locale === "vi" ? "Nhập email nhận hóa đơn" : "Enter the email for your receipt"}
            className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-slate-700">{locale === "vi" ? "Phương thức thanh toán" : "Payment method"}</span>
          <select
            value={provider}
            onChange={(event) => setProvider(event.target.value as "payos" | "paypal" | "lemonsqueezy" | "sandbox" | "manual")}
            className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
          >
            {visibleGateways.map((gateway) => (
              <option key={gateway.provider} value={gateway.provider}>
                {locale === "vi" ? gateway.labelVi : gateway.labelEn}
                {" ("}
                {gateway.currencies
                  .map((item) => (item === "VND" ? (locale === "vi" ? "VNĐ" : "VND") : "USD"))
                  .join(" / ")}
                {")"}
              </option>
            ))}
          </select>
          <p className="mt-2 text-xs text-slate-500">
            {currentCurrency === "VND"
              ? locale === "vi"
                ? "Các gói VNĐ sẽ đi qua nhóm gateway VNĐ đã bật."
                : "VNĐ packages route through the enabled VNĐ gateways."
              : locale === "vi"
                ? "Các gói USD sẽ đi qua nhóm gateway USD đã bật."
                : "USD packages route through the enabled USD gateways."}
          </p>
        </label>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-60"
      >
        <CreditCard className="h-4 w-4" />
        {loading ? (locale === "vi" ? "Đang tạo thanh toán..." : "Creating payment...") : locale === "vi" ? "Tiếp tục thanh toán" : "Continue to payment"}
        {!loading ? <ArrowRight className="h-4 w-4" /> : null}
      </button>

      {message ? <p className="text-sm text-rose-600">{message}</p> : null}
    </form>
  );
}
