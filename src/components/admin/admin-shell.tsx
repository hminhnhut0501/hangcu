import type { ReactNode } from "react";
import Link from "next/link";

type AdminPanelProps = {
  children: ReactNode;
  className?: string;
};

type AdminSectionProps = {
  children: ReactNode;
  className?: string;
};

export function AdminPanel({ children, className = "" }: AdminPanelProps) {
  return <div className={`rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_10px_35px_rgba(15,23,42,0.05)] ${className}`.trim()}>{children}</div>;
}

export function AdminSection({ children, className = "" }: AdminSectionProps) {
  return <section className={`space-y-6 ${className}`.trim()}>{children}</section>;
}

export function AdminShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f6f8fc] text-slate-950">
      <main className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
