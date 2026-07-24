"use client";

import React, { useState } from "react";

type CheckoutOption = {
  slug: string;
  name: string;
  description: string;
  amountMinor: number;
  currency: string;
};

type Props = {
  locale: "vi" | "en";
  options: CheckoutOption[];
  initialSelectedSlug?: string;
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

export function CheckoutPaymentForm({ locale, options, initialSelectedSlug, initialEmail, orderSummary }: Props) {
  const [provider, setProvider] = useState<"payos" | "paypal" | "lemonsqueezy" | "sandbox" | "manual">("payos");
  const [selectedSlug, setSelectedSlug] = useState(initialSelectedSlug ?? options[0]?.slug ?? "");
  const [email, setEmail] = useState(initialEmail ?? "");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const selectedOption = options.find((option) => option.slug === selectedSlug) ?? options[0] ?? null;

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    if (!selectedOption) {
      setMessage(locale === "vi" ? "Vui lòng chọn một gói." : "Please choose a package.");
      setLoading(false);
      return;
    }
    if (!email.trim()) {
      setMessage(locale === "vi" ? "Vui lòng nhập email." : "Please enter your email.");
      setLoading(false);
      return;
    }
    const payload: Record<string, string> = {
      provider,
      email
    };
    if (selectedOption?.slug) payload.planCode = selectedOption.slug;
    if (selectedOption?.name) payload.plan = selectedOption.name;
    if (selectedOption?.amountMinor) payload.amountMinor = String(selectedOption.amountMinor);
    if (selectedOption?.currency) payload.currency = selectedOption.currency;
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
        <label className="block">
          <span className="text-sm font-medium text-slate-700">{locale === "vi" ? "Chọn gói" : "Choose package"}</span>
          <select
            value={selectedSlug}
            onChange={(event) => setSelectedSlug(event.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
          >
            {options.map((option) => (
              <option key={option.slug} value={option.slug}>
                {option.name} - {option.currency} {(option.amountMinor / 100).toFixed(2)}
              </option>
            ))}
          </select>
          {selectedOption ? <p className="mt-2 text-sm text-slate-500">{selectedOption.description}</p> : null}
        </label>
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
