"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

type Props = {
  orderNumber: string;
  currentStatus: string;
  currentPaymentStatus: string;
  currentFulfillmentStatus: string;
  currentNotes: string | null;
};

export function OrderStatusForm({
  orderNumber,
  currentStatus,
  currentPaymentStatus,
  currentFulfillmentStatus,
  currentNotes
}: Props) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  async function readErrorMessage(response: Response) {
    const json = await response.json().catch(() => null);
    return json?.error?.message ?? json?.message ?? `Request failed (${response.status})`;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!window.confirm("Apply these order changes?")) {
      return;
    }
    setStatus("loading");
    setMessage("");

    try {
      const formData = new FormData(event.currentTarget);
      const csrfResponse = await fetch("/api/admin/csrf", { method: "GET", credentials: "include" });
      const csrfJson = (await csrfResponse.json()) as { data?: { token?: string } };
      const token = csrfJson.data?.token;
      if (!token) throw new Error("Missing CSRF token");

      const payload = {
        orderNumber,
        status: String(formData.get("status") ?? ""),
        paymentStatus: String(formData.get("paymentStatus") ?? ""),
        fulfillmentStatus: String(formData.get("fulfillmentStatus") ?? ""),
        notes: String(formData.get("notes") ?? "")
      };

      const response = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
          "x-csrf-token": token
        },
        credentials: "include",
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error(await readErrorMessage(response));
      setStatus("done");
      setMessage("Order updated.");
      router.refresh();
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Update failed.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Order status</span>
          <select
            name="status"
            defaultValue={currentStatus}
            className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
          >
            <option value="pending">pending</option>
            <option value="paid">paid</option>
            <option value="processing">processing</option>
            <option value="fulfilled">fulfilled</option>
            <option value="failed">failed</option>
            <option value="cancelled">cancelled</option>
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Payment status</span>
          <select
            name="paymentStatus"
            defaultValue={currentPaymentStatus}
            className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
          >
            <option value="unpaid">unpaid</option>
            <option value="pending">pending</option>
            <option value="paid">paid</option>
            <option value="failed">failed</option>
            <option value="refunded">refunded</option>
            <option value="partially_refunded">partially_refunded</option>
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Fulfillment status</span>
          <select
            name="fulfillmentStatus"
            defaultValue={currentFulfillmentStatus}
            className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
          >
            <option value="unfulfilled">unfulfilled</option>
            <option value="processing">processing</option>
            <option value="partially_fulfilled">partially_fulfilled</option>
            <option value="fulfilled">fulfilled</option>
            <option value="failed">failed</option>
          </select>
        </label>
        <label className="block md:col-span-2">
          <span className="text-sm font-medium text-slate-700">Internal notes</span>
          <textarea
            name="notes"
            rows={4}
            defaultValue={currentNotes ?? ""}
            className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
            placeholder="Add admin-only notes..."
          />
        </label>
      </div>
      <div className="mt-6 flex items-center gap-3">
        <button
          type="submit"
          className="rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white disabled:opacity-50"
          disabled={status === "loading"}
        >
          {status === "loading" ? "Saving..." : "Save changes"}
        </button>
        <p className="text-sm text-slate-600">
          {status === "done" ? message : status === "error" ? message || "Update failed." : null}
        </p>
      </div>
    </form>
  );
}
