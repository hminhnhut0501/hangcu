"use client";

import type { ReactNode } from "react";
import { useState } from "react";

type Props = {
  trigger: ReactNode;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "default" | "danger";
  onConfirm: () => Promise<void> | void;
};

export function AdminConfirmDialog({
  trigger,
  title,
  description,
  confirmLabel = "Xác nhận",
  cancelLabel = "Hủy",
  tone = "default",
  onConfirm
}: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleConfirm() {
    try {
      setLoading(true);
      setError("");
      await onConfirm();
      setOpen(false);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Thao tác thất bại.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={() => setOpen(true)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            setOpen(true);
          }
        }}
        className="inline-flex"
      >
        {trigger}
      </div>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-slate-950">{title}</h3>
            {description ? <p className="mt-2 text-sm leading-7 text-slate-600">{description}</p> : null}
            {error ? <p className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                disabled={loading}
              >
                {cancelLabel}
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className={`rounded-full px-4 py-2 text-sm font-medium text-white ${
                  tone === "danger" ? "bg-rose-600 hover:bg-rose-700" : "bg-slate-950 hover:bg-slate-800"
                }`}
                disabled={loading}
              >
                {loading ? "Đang xử lý..." : confirmLabel}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
