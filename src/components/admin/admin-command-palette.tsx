"use client";

import type { Route } from "next";
import { Command, Search } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

type CommandAction = {
  label: string;
  description: string;
  href: Route;
  keywords?: ReadonlyArray<string>;
  group?: string;
};

type Props = {
  actions: ReadonlyArray<CommandAction>;
};

export function AdminCommandPalette({ actions }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const isCmdK = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k";
      if (isCmdK) {
        event.preventDefault();
        setOpen((value) => !value);
      }
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      window.setTimeout(() => inputRef.current?.focus(), 0);
    }
    if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return actions;
    return actions.filter((action) => {
      const haystack = [action.label, action.description, action.group ?? "", ...(action.keywords ?? [])].join(" ").toLowerCase();
      return haystack.includes(term);
    });
  }, [actions, query]);

  const grouped = useMemo(() => {
    return filtered.reduce<Record<string, CommandAction[]>>((acc, action) => {
      const group = action.group ?? "Nút nhanh";
      acc[group] ??= [];
      acc[group].push(action);
      return acc;
    }, {});
  }, [filtered]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-4 flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm text-slate-100 transition hover:bg-white/10"
      >
        <span className="flex items-center gap-2 font-medium text-white">
          <Command className="h-4 w-4" />
          Lệnh nhanh
        </span>
        <span className="rounded-full border border-white/10 bg-black/20 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-300">
          Ctrl K
        </span>
      </button>

      <dialog
        ref={dialogRef}
        className="w-[min(96vw,780px)] rounded-[28px] border border-slate-200 bg-white p-0 shadow-2xl backdrop:bg-slate-950/60"
        onClose={() => setOpen(false)}
      >
        <div className="border-b border-slate-200 px-5 py-4">
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              ref={inputRef}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Tìm màn, thao tác hoặc shortcut..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
            />
          </div>
        </div>
        <div className="max-h-[75vh] overflow-auto p-5">
          {Object.keys(grouped).length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              Không tìm thấy lệnh phù hợp.
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(grouped).map(([group, items]) => (
                <div key={group} className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">{group}</p>
                  <div className="grid gap-3">
                    {items.map((action) => (
                      <button
                        key={`${group}-${action.href}`}
                        type="button"
                        onClick={() => {
                          setOpen(false);
                          router.push(action.href);
                        }}
                        className="rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
                      >
                        <p className="text-sm font-semibold text-slate-950">{action.label}</p>
                        <p className="mt-1 text-sm text-slate-600">{action.description}</p>
                        <p className="mt-3 text-xs font-medium text-slate-400">{action.href}</p>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </dialog>
    </>
  );
}
