"use client";

import React, { useState } from "react";

type CheckoutOption = {
  slug: string;
  code: string;
  kind: "license" | "support";
  name: string;
  description: string;
  amountMinor: number;
  currency: string;
};

type Props = {
  locale: "vi" | "en";
  licenseOptions: CheckoutOption[];
  supportOptions: CheckoutOption[];
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
    <form onSubmit={submit} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="grid gap-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <button
            type="button"
            onClick={() => setMode("license")}
            className={`rounded-2xl border px-4 py-4 text-left transition ${
              mode === "license" ? "border-slate-950 bg-slate-950 text-white" : "border-slate-200 bg-white hover:border-slate-300"
            }`}
          >
            <p className="text-sm font-semibold">{locale === "vi" ? "Gói license" : "License pack"}</p>
            <p className="mt-2 text-sm font-medium">{locale === "vi" ? "30 ngày / trọn đời" : "30-day / lifetime"}</p>
            <p className="mt-1 text-sm opacity-80">
              {locale === "vi" ? "Chọn license để đi thanh toán ngay." : "Pick a license and continue to payment."}
            </p>
          </button>
          <button
            type="button"
            onClick={() => setMode("support")}
            className={`rounded-2xl border px-4 py-4 text-left transition ${
              mode === "support" ? "border-slate-950 bg-slate-950 text-white" : "border-slate-200 bg-white hover:border-slate-300"
            }`}
          >
            <p className="text-sm font-semibold">{locale === "vi" ? "Gói support" : "Support pack"}</p>
            <p className="mt-2 text-sm font-medium">{locale === "vi" ? "Chọn mức gợi ý" : "Choose a suggested amount"}</p>
            <p className="mt-1 text-sm opacity-80">
              {locale === "vi" ? "Đi theo mức hỗ trợ đã đặt sẵn." : "Use one of the preset support tiers."}
            </p>
          </button>
          <button
            type="button"
            onClick={() => setMode("custom")}
            className={`rounded-2xl border px-4 py-4 text-left transition ${
              mode === "custom" ? "border-slate-950 bg-slate-950 text-white" : "border-slate-200 bg-white hover:border-slate-300"
            }`}
          >
            <p className="text-sm font-semibold">{locale === "vi" ? "Ủng hộ tự do" : "Custom support"}</p>
            <p className="mt-2 text-sm font-medium">{locale === "vi" ? "Tự nhập số tiền" : "Enter your own amount"}</p>
            <p className="mt-1 text-sm opacity-80">
              {locale === "vi" ? "Dành cho khách muốn nhập số tiền bất kỳ." : "For customers who want to enter any amount."}
            </p>
          </button>
        </div>

        {mode === "license" ? (
          <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-medium text-slate-700">{locale === "vi" ? "Chọn license" : "Choose a license"}</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {activeLicenseOptions.map((option) => (
                <button
                  key={option.slug}
                  type="button"
                  onClick={() => {
                    setSelectedSlug(option.slug);
                    setCustomAmount("");
                  }}
                  className={`rounded-2xl border px-4 py-4 text-left transition ${
                    selectedSlug === option.slug ? "border-slate-950 bg-white shadow-sm" : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <p className="text-sm font-medium text-slate-500">{option.code}</p>
                  <p className="mt-2 text-base font-semibold text-slate-900">{option.name}</p>
                  <p className="mt-2 text-sm text-slate-600">{option.description}</p>
                  <p className="mt-3 text-sm font-semibold text-slate-900">
                    {option.currency} {(option.amountMinor / 100).toFixed(2)}
                  </p>
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {mode === "support" ? (
          <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-medium text-slate-700">{locale === "vi" ? "Chọn gói support" : "Choose a support pack"}</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {activeSupportOptions.map((option) => (
                <button
                  key={option.slug}
                  type="button"
                  onClick={() => {
                    setSelectedSlug(option.slug);
                    setCustomAmount(String(option.amountMinor));
                  }}
                  className={`rounded-2xl border px-4 py-4 text-left transition ${
                    selectedSlug === option.slug ? "border-slate-950 bg-white shadow-sm" : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <p className="text-sm font-medium text-slate-500">{option.code}</p>
                  <p className="mt-2 text-base font-semibold text-slate-900">{option.name}</p>
                  <p className="mt-2 text-sm text-slate-600">{option.description}</p>
                  <p className="mt-3 text-sm font-semibold text-slate-900">
                    {option.currency} {(option.amountMinor / 100).toFixed(2)}
                  </p>
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
            <option value="payos">PayOS</option>
            <option value="paypal" disabled={Boolean(orderSummary.currency) && orderSummary.currency?.toUpperCase() !== "USD"}>PayPal (USD)</option>
            <option value="lemonsqueezy" disabled={Boolean(orderSummary.currency) && orderSummary.currency?.toUpperCase() !== "USD"}>Lemon Squeezy (USD)</option>
            <option value="sandbox">Sandbox</option>
            <option value="manual">Manual</option>
          </select>
        </label>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white disabled:opacity-60"
      >
        {loading ? (locale === "vi" ? "Đang tạo thanh toán..." : "Creating payment...") : locale === "vi" ? "Tiếp tục thanh toán" : "Continue to payment"}
      </button>

      {message ? <p className="text-sm text-rose-600">{message}</p> : null}
    </form>
  );
}
