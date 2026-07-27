"use client";

import { useRouter } from "next/navigation";
import { AdminConfirmDialog } from "@/components/admin/admin-confirm-dialog";

export function SupportPackageActions({ id }: { id: string }) {
  const router = useRouter();

  async function handleDelete() {
    const csrfResponse = await fetch("/api/admin/csrf", { method: "GET", credentials: "include" });
    const csrfJson = (await csrfResponse.json()) as { data?: { token?: string } };
    const token = csrfJson.data?.token;
    if (!token) throw new Error("Missing CSRF token");

    const response = await fetch("/api/admin/donate-packages", {
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

    router.refresh();
  }

  return (
    <AdminConfirmDialog
      trigger={
        <button
          type="button"
          className="rounded-full border border-rose-200 px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-50"
        >
          Xóa
        </button>
      }
      title="Xóa support package"
      description="Xóa gói support này sẽ ảnh hưởng tới checkout và homepage. Hành động không thể hoàn tác."
      confirmLabel="Xóa gói"
      cancelLabel="Hủy"
      tone="danger"
      onConfirm={handleDelete}
    />
  );
}
