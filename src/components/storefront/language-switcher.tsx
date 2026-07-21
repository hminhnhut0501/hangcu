"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

type Props = {
  currentLocale: "vi" | "en";
};

export function LanguageSwitcher({ currentLocale }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function switchLocale(nextLocale: "vi" | "en") {
    startTransition(async () => {
      document.cookie = `lang=${nextLocale}; path=/; max-age=31536000; samesite=lax`;
      router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white p-1 text-xs font-medium">
      <button
        type="button"
        onClick={() => switchLocale("vi")}
        className={`rounded-full px-3 py-1.5 ${currentLocale === "vi" ? "bg-slate-950 text-white" : "text-slate-600"}`}
        disabled={isPending}
      >
        VI
      </button>
      <button
        type="button"
        onClick={() => switchLocale("en")}
        className={`rounded-full px-3 py-1.5 ${currentLocale === "en" ? "bg-slate-950 text-white" : "text-slate-600"}`}
        disabled={isPending}
      >
        EN
      </button>
    </div>
  );
}
