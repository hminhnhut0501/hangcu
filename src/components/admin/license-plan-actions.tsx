"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AdminBanner, getAdminErrorMessage } from "@/components/admin/admin-feedback";

export function LicensePlanActions({ id }: { id: string }) {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleDelete() {
    if (!window.confirm("Xóa plan này? Hành động không thể hoàn tác.")) return;
    setState("loading");
    setMessage("");
    try {
      const csrfResponse = await fetch("/api/admin/csrf", { method: "GET", credentials: "include" });
      const csrfJson = (await csrfResponse.json()) as { data?: { token?: string } };
      const token = csrfJson.data?.token;
      if (!token) throw new Error("Missing CSRF token");

      const response = await fetch("/api/admin/license-plans", {
        method: "DELETE",
        headers: {
          "content-type": "application/json",
          "x-csrf-token": token
        },
        credentials: "include",
        body: JSON.stringify({ id })
      });
      if (!response.ok) {
        const json = await response.json().catch(() => null);
        throw new Error(json?.error?.message ?? `Request failed (${response.status})`);
      }
      setState("done");
      setMessage("Đã xóa plan.");
      router.refresh();
    } catch (error) {
      setState("error");
      setMessage(getAdminErrorMessage(error, "Xóa thất bại."));
    }
  }

  return (
    <div className="flex items-center gap-3">
      <Link href={`/admin/license-plans?edit=${encodeURIComponent(id)}`} className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50">
        Sửa
      </Link>
      <button
        type="button"
        onClick={handleDelete}
        disabled={state === "loading"}
        className="rounded-full border border-rose-200 px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-50 disabled:opacity-50"
      >
        {state === "loading" ? "Đang xóa..." : "Xóa"}
      </button>
      {state === "done" ? <AdminBanner tone="success" message={message} /> : null}
      {state === "error" ? <AdminBanner tone="error" message={message} /> : null}
    </div>
  );
}
