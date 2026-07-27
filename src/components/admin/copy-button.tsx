"use client";

import { useState } from "react";

type Props = {
  value: string;
  label: string;
  copiedLabel?: string;
  className?: string;
};

export function CopyButton({ value, label, copiedLabel = "Đã sao chép", className = "" }: Props) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      className={`rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 ${className}`.trim()}
      onClick={async () => {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1500);
      }}
    >
      {copied ? copiedLabel : label}
    </button>
  );
}
