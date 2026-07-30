"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function LicenseFulfillmentProgress({ locale }: { locale: "vi" | "en" }) {
  const [progress, setProgress] = useState(8);
  const [attempt, setAttempt] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const startedAt = Date.now();
    const timer = window.setInterval(() => {
      const elapsed = Date.now() - startedAt;
      setProgress(Math.min(96, 8 + Math.round((elapsed / 30000) * 88)));
      setAttempt((value) => value + 1);
      if (elapsed >= 30000) {
        window.clearInterval(timer);
        return;
      }
      router.refresh();
    }, 4000);
    return () => window.clearInterval(timer);
  }, [router]);

  return (
    <div className="mt-4 rounded-xl border border-emerald-200 bg-white/70 p-4 text-sm text-emerald-950">
      <div className="flex items-center justify-between gap-3">
        <span>{locale === "vi" ? "Đang cấp license..." : "Issuing your license..."}</span>
        <span>{progress}%</span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-emerald-100">
        <div className="h-full rounded-full bg-emerald-500 transition-all duration-700" style={{ width: `${progress}%` }} />
      </div>
      <p className="mt-2 text-xs text-emerald-700">
        {locale === "vi" ? "Trang sẽ tự kiểm tra lại trong giây lát." : "This page will check again shortly."}
      </p>
      <span className="sr-only">{attempt}</span>
    </div>
  );
}
