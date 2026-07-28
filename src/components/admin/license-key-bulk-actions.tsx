"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AdminStatusBadge } from "@/components/admin/admin-status-badge";

type LicenseKeyRow = {
  id: string;
  codeLastFour: string;
  licensePlanId: string;
  status: string;
  customerRef: string | null;
  externalUserId: string | null;
  href: string;
};

type Props = {
  keys: LicenseKeyRow[];
};

async function readErrorMessage(response: Response) {
  const json = await response.json().catch(() => null);
  return json?.error?.message ?? json?.message ?? `Request failed (${response.status})`;
}

export function LicenseKeyBulkActions({ keys }: Props) {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);
  const [status, setStatus] = useState<"expired" | "revoked">("revoked");
  const [reason, setReason] = useState("Bulk action");
  const [message, setMessage] = useState("");

  const selectedCount = selected.length;
  const presets = [
    { label: "Available", value: "available" },
    { label: "Issued", value: "issued" },
    { label: "Redeemed", value: "redeemed" },
    { label: "Revoked", value: "revoked" }
  ] as const;

  function toggle(id: string) {
    setSelected((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id]
    );
  }

  function selectPreset(preset: (typeof presets)[number]["value"]) {
    setSelected(keys.filter((key) => key.status === preset).map((key) => key.id));
  }

  async function applyBulk() {
    if (selectedCount === 0) return;
    if (!window.confirm(`Áp dụng trạng thái ${status} cho ${selectedCount} key?`)) return;

    setMessage("");
    const csrfResponse = await fetch("/api/admin/csrf", { method: "GET", credentials: "include" });
    const csrfJson = (await csrfResponse.json()) as { data?: { token?: string } };
    const token = csrfJson.data?.token;
    if (!token) throw new Error("Missing CSRF token");

    const response = await fetch("/api/admin/license-keys/bulk", {
      method: "PATCH",
      headers: {
        "content-type": "application/json",
        "x-csrf-token": token
      },
      credentials: "include",
      body: JSON.stringify({
        ids: selected,
        status,
        reason
      })
    });

    if (!response.ok) {
      throw new Error(await readErrorMessage(response));
    }

    setMessage(`Đã cập nhật ${selectedCount} key.`);
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
            onChange={(event) => setStatus(event.target.value as "expired" | "revoked")}
            className="rounded-xl border border-slate-200 px-3 py-2"
          >
            <option value="revoked">revoked</option>
            <option value="expired">expired</option>
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm">
          <span className="font-medium text-slate-700">Reason</span>
          <input
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-2"
          />
        </label>
        <button type="button" onClick={applyBulk} disabled={selectedCount === 0} className="rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white disabled:opacity-40">
          Áp dụng cho {selectedCount} key
        </button>
        <button
          type="button"
          onClick={() => setSelected(keys.map((key) => key.id))}
          className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700"
        >
          Chọn tất cả
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

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-6 py-4 font-medium">Chọn</th>
              <th className="px-6 py-4 font-medium">Key</th>
              <th className="px-6 py-4 font-medium">Gói</th>
              <th className="px-6 py-4 font-medium">Trạng thái</th>
              <th className="px-6 py-4 font-medium">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {keys.map((key) => (
              <tr key={key.id}>
                <td className="px-6 py-4">
                  <input
                    type="checkbox"
                    checked={selected.includes(key.id)}
                    onChange={() => toggle(key.id)}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600"
                  />
                </td>
                <td className="px-6 py-4 font-medium">****{key.codeLastFour}</td>
                <td className="px-6 py-4">{key.licensePlanId}</td>
                <td className="px-6 py-4 text-slate-600">{key.status}</td>
                <td className="px-6 py-4">
                  <Link
                    href={key.href as any}
                    className="rounded-full border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700"
                  >
                    Mở chi tiết
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
