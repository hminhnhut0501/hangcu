"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

type Props = {
  keyId: string;
  currentStatus: string;
  currentExpiresAt: string | null;
  currentRevokedReason: string | null;
  currentCustomerRef: string | null;
  currentExternalUserId: string | null;
  currentNotes: string | null;
};

export function LicenseKeyActionsForm({
  keyId,
  currentStatus,
  currentExpiresAt,
  currentRevokedReason,
  currentCustomerRef,
  currentExternalUserId,
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
    if (!window.confirm("Save license lifecycle changes?")) {
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
        id: keyId,
        status: String(formData.get("status") ?? currentStatus),
        expiresAt: String(formData.get("expiresAt") ?? "").trim() || null,
        revokedReason: String(formData.get("revokedReason") ?? "").trim() || null,
        customerRef: String(formData.get("customerRef") ?? "").trim() || null,
        externalUserId: String(formData.get("externalUserId") ?? "").trim() || null,
        notes: String(formData.get("notes") ?? "").trim() || null
      };

      const response = await fetch("/api/admin/license-keys/status", {
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
      setMessage("License key updated.");
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
          <span className="text-sm font-medium text-slate-700">Status</span>
          <select
            name="status"
            defaultValue={currentStatus}
            className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
          >
            <option value="available">available</option>
            <option value="reserved">reserved</option>
            <option value="issued">issued</option>
            <option value="redeemed">redeemed</option>
            <option value="expired">expired</option>
            <option value="revoked">revoked</option>
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Expires at</span>
          <input
            name="expiresAt"
            defaultValue={currentExpiresAt ?? ""}
            className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
            placeholder="2026-07-21T00:00:00.000Z"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Customer ref</span>
          <input
            name="customerRef"
            defaultValue={currentCustomerRef ?? ""}
            className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-slate-700">External user ID</span>
          <input
            name="externalUserId"
            defaultValue={currentExternalUserId ?? ""}
            className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
          />
        </label>
        <label className="block md:col-span-2">
          <span className="text-sm font-medium text-slate-700">Revoked reason</span>
          <input
            name="revokedReason"
            defaultValue={currentRevokedReason ?? ""}
            className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
          />
        </label>
        <label className="block md:col-span-2">
          <span className="text-sm font-medium text-slate-700">Internal notes</span>
          <textarea
            name="notes"
            rows={4}
            defaultValue={currentNotes ?? ""}
            className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
          />
        </label>
      </div>
      <div className="mt-6 flex items-center gap-3">
        <button
          type="submit"
          className="rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white disabled:opacity-50"
          disabled={status === "loading"}
        >
          {status === "loading" ? "Saving..." : "Save lifecycle changes"}
        </button>
        <p className="text-sm text-slate-600">
          {status === "done" ? message : status === "error" ? message || "Update failed." : null}
        </p>
      </div>
    </form>
  );
}
