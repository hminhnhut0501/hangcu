"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AdminStatusBadge } from "@/components/admin/admin-status-badge";
import { AdminMoneyDisplay } from "@/components/admin/admin-money-display";

type OrderRow = {
  orderNumber: string;
  customerEmail: string;
  source: string;
  status: string;
  paymentStatus: string;
  fulfillmentStatus: string;
  paymentProvider: string;
  providerReference: string;
  totalMinor: number;
  currency: string;
  createdAt: string;
  href: string;
};

type Props = {
  orders: OrderRow[];
};

async function readErrorMessage(response: Response) {
  const json = await response.json().catch(() => null);
  return json?.error?.message ?? json?.message ?? `Request failed (${response.status})`;
}

export function OrderBulkActions({ orders }: Props) {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);
  const [status, setStatus] = useState("processing");
  const [message, setMessage] = useState("");
  const selectedCount = selected.length;
  const presets = [
    { label: "Pending", value: "pending" },
    { label: "Paid", value: "paid" },
    { label: "Processing", value: "processing" },
    { label: "Fulfilled", value: "fulfilled" },
    { label: "Failed", value: "failed" }
  ] as const;

  function toggle(orderNumber: string) {
    setSelected((current) =>
      current.includes(orderNumber) ? current.filter((value) => value !== orderNumber) : [...current, orderNumber]
    );
  }

  function selectPreset(preset: (typeof presets)[number]["value"]) {
    setSelected(
      orders
        .filter((order) => order.status === preset || order.paymentStatus === preset || order.fulfillmentStatus === preset)
        .map((order) => order.orderNumber)
    );
  }

  async function applyBulk() {
    if (selectedCount === 0) return;
    if (!window.confirm(`Áp dụng trạng thái hàng loạt cho ${selectedCount} đơn hàng?`)) return;

    setMessage("");
    const csrfResponse = await fetch("/api/admin/csrf", { method: "GET", credentials: "include" });
    const csrfJson = (await csrfResponse.json()) as { data?: { token?: string } };
    const token = csrfJson.data?.token;
    if (!token) throw new Error("Missing CSRF token");

    const response = await fetch("/api/admin/orders/bulk", {
      method: "PATCH",
      headers: {
        "content-type": "application/json",
        "x-csrf-token": token
      },
      credentials: "include",
      body: JSON.stringify({
        orderNumbers: selected,
        status
      })
    });

    if (!response.ok) {
      throw new Error(await readErrorMessage(response));
    }

    setMessage(`Đã cập nhật ${selectedCount} đơn hàng.`);
    setSelected([]);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-slate-400">Chọn nhanh</span>
          {presets.map((preset) => (
            <button
              key={preset.value}
              type="button"
              onClick={() => selectPreset(preset.value)}
              className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-white"
            >
              {preset.label}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 text-sm">
          <span className="font-medium text-slate-700">Trạng thái hàng loạt</span>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-2"
          >
            <option value="pending">pending</option>
            <option value="paid">paid</option>
            <option value="processing">processing</option>
            <option value="fulfilled">fulfilled</option>
            <option value="failed">failed</option>
            <option value="cancelled">cancelled</option>
          </select>
        </label>
        <button
          type="button"
          onClick={applyBulk}
          disabled={selectedCount === 0}
          className="rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
        >
          Áp dụng cho {selectedCount} đơn
        </button>
        <button
          type="button"
          onClick={() => setSelected(orders.map((order) => order.orderNumber))}
          className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700"
        >
          Chọn trang này
        </button>
        <button
          type="button"
          onClick={() => setSelected([])}
          className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700"
        >
          Bỏ chọn
        </button>
        <AdminStatusBadge label={`Đã chọn ${selectedCount}`} tone={selectedCount ? "blue" : "neutral"} />
        <p className="text-sm text-slate-600">{message}</p>
      </div>

      <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-[0_10px_35px_rgba(15,23,42,0.05)]">
        <table className="min-w-[980px] divide-y divide-slate-200 text-sm">
          <thead className="bg-[#f8fbff] text-left text-slate-500">
            <tr>
              <th className="w-14 px-4 py-3 font-medium">Chọn</th>
              <th className="px-4 py-3 font-medium">Đơn hàng</th>
              <th className="px-4 py-3 font-medium">Khách hàng</th>
              <th className="px-4 py-3 font-medium">Trạng thái</th>
              <th className="px-4 py-3 font-medium">Cổng / mã</th>
              <th className="px-4 py-3 font-medium">Tổng</th>
              <th className="px-4 py-3 font-medium">Tạo lúc</th>
              <th className="px-4 py-3 font-medium">Mở</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {orders.length === 0 ? (
              <tr>
                <td className="px-4 py-10 text-center text-slate-500" colSpan={8}>
                  Không có đơn phù hợp với bộ lọc hiện tại.
                </td>
              </tr>
            ) : orders.map((order) => (
              <tr key={order.orderNumber}>
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selected.includes(order.orderNumber)}
                    onChange={() => toggle(order.orderNumber)}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600"
                  />
                </td>
                <td className="px-4 py-3">
                  <Link href={order.href as any} className="font-medium text-blue-700 hover:underline">
                    {order.orderNumber}
                  </Link>
                  <p className="mt-1 text-xs text-slate-500">{order.source}</p>
                </td>
                <td className="max-w-[220px] px-4 py-3">
                  <p className="truncate font-medium" title={order.customerEmail}>{order.customerEmail}</p>
                  <p className="mt-1 text-xs text-slate-500">{order.currency}</p>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1.5">
                    <AdminStatusBadge label={order.status} tone={order.status === "failed" ? "rose" : order.status === "paid" ? "emerald" : "neutral"} />
                    <AdminStatusBadge label={order.paymentStatus} tone={order.paymentStatus === "paid" ? "emerald" : order.paymentStatus === "pending" || order.paymentStatus === "unpaid" ? "amber" : "rose"} />
                    <AdminStatusBadge label={order.fulfillmentStatus} tone={order.fulfillmentStatus === "fulfilled" ? "emerald" : "amber"} />
                  </div>
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium">{order.paymentProvider}</p>
                  <p className="max-w-[180px] truncate text-xs text-slate-500" title={order.providerReference}>{order.providerReference}</p>
                </td>
                <td className="whitespace-nowrap px-4 py-3 font-medium">
                  <AdminMoneyDisplay amount={order.totalMinor} currency={order.currency} locale="vi" />
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-500">
                  {order.createdAt ? new Date(order.createdAt).toLocaleString("vi-VN") : "-"}
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={order.href as any}
                    className="rounded-full border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700"
                  >
                    Mở
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
