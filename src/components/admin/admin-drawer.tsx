"use client";

import { ReactNode, useEffect, useRef, useState } from "react";

type Props = {
  trigger: ReactNode;
  title: string;
  description?: string;
  children: ReactNode;
  defaultOpen?: boolean;
};

export function AdminDrawer({ trigger, title, description, children, defaultOpen = false }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(defaultOpen);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
    }
    if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <>
      <div
        onClick={() => setOpen(true)}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") setOpen(true);
        }}
      >
        {trigger}
      </div>
      <dialog
        ref={dialogRef}
        className="w-[min(96vw,1100px)] rounded-[28px] border border-slate-200 bg-white p-0 shadow-2xl backdrop:bg-slate-950/60"
        onClose={() => setOpen(false)}
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
          <div>
            <h3 className="text-xl font-semibold text-slate-950">{title}</h3>
            {description ? <p className="mt-1 text-sm text-slate-600">{description}</p> : null}
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Đóng
          </button>
        </div>
        <div className="max-h-[80vh] overflow-auto px-6 py-5">{children}</div>
      </dialog>
    </>
  );
}
