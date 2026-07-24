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

export function CheckoutPaymentForm({ locale, options, orderSummary }: Props) {
  const [provider, setProvider] = useState<"payos" | "sandbox" | "manual">("payos");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    const selectedOption = options[0] ?? null;
    const payload: Record<string, string> = {
      provider
    };
    if (orderSummary.orderNumber) payload.orderNumber = orderSummary.orderNumber;
    if (orderSummary.checkoutId) payload.checkoutId = orderSummary.checkoutId;
    if (orderSummary.planCode) payload.planCode = orderSummary.planCode;
    if (orderSummary.planLabel) payload.plan = orderSummary.planLabel;
    if (orderSummary.amountLabel) payload.amountLabel = orderSummary.amountLabel;
    if (orderSummary.customerRef) payload.customerRef = orderSummary.customerRef;
    if (typeof orderSummary.amountMinor === "number") payload.amountMinor = String(orderSummary.amountMinor);
    if (orderSummary.currency) payload.currency = orderSummary.currency;
    if (selectedOption?.slug) payload.productSlug = selectedOption.slug;
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
          <span className="text-sm font-medium text-slate-700">{locale === "vi" ? "Phương thức thanh toán" : "Payment method"}</span>
          <select
            value={provider}
            onChange={(event) => setProvider(event.target.value as "payos" | "sandbox" | "manual")}
            className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
          >
            <option value="payos">PayOS</option>
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
        {loading ? (locale === "vi" ? "Đang tạo thanh toán..." : "Creating payment...") : locale === "vi" ? "Thanh toán ngay" : "Pay now"}
      </button>

      {message ? <p className="text-sm text-rose-600">{message}</p> : null}
    </form>
  );
}
