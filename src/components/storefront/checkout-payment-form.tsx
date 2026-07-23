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
};

export function CheckoutPaymentForm({ locale, options }: Props) {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedSlug, setSelectedSlug] = useState(options[0]?.slug ?? "");
  const [provider, setProvider] = useState<"payos" | "sandbox" | "manual">("payos");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const response = await fetch("/api/checkout/pay", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email,
          fullName,
          couponCode,
          notes,
          productSlug: selectedSlug,
          provider
        })
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
          <span className="text-sm font-medium text-slate-700">{locale === "vi" ? "Email" : "Email"}</span>
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            type="email"
            required
            className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
            placeholder="you@example.com"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-slate-700">{locale === "vi" ? "Họ và tên" : "Full name"}</span>
          <input
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
            placeholder={locale === "vi" ? "Không bắt buộc" : "Optional"}
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-slate-700">{locale === "vi" ? "Mã giảm giá" : "Coupon code"}</span>
          <input
            value={couponCode}
            onChange={(event) => setCouponCode(event.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
            placeholder={locale === "vi" ? "Không bắt buộc" : "Optional"}
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-slate-700">{locale === "vi" ? "Thanh toán cho" : "Pay for"}</span>
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
        </label>
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
        <label className="block">
          <span className="text-sm font-medium text-slate-700">{locale === "vi" ? "Ghi chú" : "Notes"}</span>
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            rows={3}
            className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
            placeholder={locale === "vi" ? "Không bắt buộc" : "Optional"}
          />
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
