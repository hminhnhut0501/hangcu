"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  ChevronRight,
  CircleDollarSign,
  ClipboardList,
  FileText,
  LayoutDashboard,
  ListChecks,
  ShoppingCart,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Ticket,
  Upload,
  Webhook,
  FileCog
} from "lucide-react";

type AdminPanelProps = {
  children: ReactNode;
  className?: string;
};

type AdminSectionProps = {
  children: ReactNode;
  className?: string;
};

type NavIcon = typeof LayoutDashboard;
type NavItem = { label: string; href: string };
type NavSection = { title: string; items: NavItem[] };

export function AdminPanel({ children, className = "" }: AdminPanelProps) {
  return <div className={`rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_10px_35px_rgba(15,23,42,0.05)] ${className}`.trim()}>{children}</div>;
}

export function AdminSection({ children, className = "" }: AdminSectionProps) {
  return <section className={`space-y-6 ${className}`.trim()}>{children}</section>;
}

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const storageKey = "admin-sidebar-collapsed";
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem(storageKey);
    if (saved !== null) {
      setCollapsed(saved === "1");
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(storageKey, collapsed ? "1" : "0");
  }, [collapsed]);

  const navSections: NavSection[] = [
    {
      title: "VẬN HÀNH",
      items: [
        { label: "Tổng quan", href: "/admin" },
        { label: "Thống kê", href: "/admin/analytics" },
        { label: "Audit", href: "/admin/audit" },
        { label: "Đơn hàng", href: "/admin/orders" },
        { label: "Thanh toán", href: "/admin/payments" },
        { label: "License plans", href: "/admin/license-plans" },
        { label: "License keys", href: "/admin/license-keys" }
      ]
    },
    {
      title: "CẤU HÌNH",
      items: [
        { label: "Donate packages", href: "/admin/donate-packages" },
        { label: "Coupons", href: "/admin/coupons" },
        { label: "Media", href: "/admin/media" },
        { label: "Site settings", href: "/admin/site-settings" },
        { label: "Webhooks", href: "/admin/webhooks" },
        { label: "Compliance", href: "/admin/compliance" },
        { label: "Hardening", href: "/admin/hardening" }
      ]
    }
  ];

  const iconMap: Record<string, NavIcon> = {
    "/admin": LayoutDashboard,
    "/admin/analytics": Activity,
    "/admin/audit": ListChecks,
    "/admin/orders": ShoppingCart,
    "/admin/payments": CircleDollarSign,
    "/admin/license-plans": FileText,
    "/admin/license-keys": ClipboardList,
    "/admin/donate-packages": Sparkles,
    "/admin/coupons": Ticket,
    "/admin/media": Upload,
    "/admin/site-settings": FileCog,
    "/admin/webhooks": Webhook,
    "/admin/compliance": ShieldCheck,
    "/admin/hardening": ShieldAlert
  };

  const sidebarWidth = collapsed ? "lg:grid-cols-[88px_1fr]" : "lg:grid-cols-[280px_1fr]";
  const isActive = useMemo(
    () => (href: string) => pathname === href || (href !== "/admin" && pathname.startsWith(`${href}/`)),
    [pathname]
  );

  return (
    <div className="min-h-screen bg-[#f6f8fc] text-slate-950">
      <div className={`grid min-h-screen transition-all duration-200 ${sidebarWidth}`}>
        <aside className="border-b border-slate-200 bg-[#0f172a] text-slate-100 lg:border-b-0 lg:border-r lg:border-slate-200">
          <div className="sticky top-0 flex h-full flex-col px-4 py-5">
            <div className={`rounded-3xl border border-white/10 bg-white/5 px-4 py-4 ${collapsed ? "lg:px-3" : ""}`}>
              <div className="flex items-center justify-between gap-3">
                <div className={collapsed ? "lg:hidden" : ""}>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Hang Cú VIP</p>
                  <p className="mt-2 text-lg font-semibold text-white">Admin menu</p>
                </div>
                <button
                  type="button"
                  onClick={() => setCollapsed((value) => !value)}
                  aria-label={collapsed ? "Mở sidebar" : "Thu gọn sidebar"}
                  className="rounded-full border border-white/10 bg-white/10 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/20"
                >
                  {collapsed ? "Mở" : "Thu"}
                </button>
              </div>
            </div>
            <nav className="mt-6 space-y-6 overflow-auto pr-1">
              {navSections.map((section) => (
                <div key={section.title} className="space-y-2">
                  <p className={`px-3 text-xs font-semibold uppercase tracking-[0.3em] text-slate-400 ${collapsed ? "lg:hidden" : ""}`}>{section.title}</p>
                  <div className="space-y-1">
                    {section.items.map((item) => {
                      const Icon = iconMap[item.href] ?? LayoutDashboard;
                      return (
                        <Link
                          key={item.href}
                          href={item.href as any}
                          title={collapsed ? item.label : undefined}
                          aria-label={item.label}
                          className={`group flex items-center gap-3 rounded-2xl px-3 py-2 text-sm font-medium transition ${
                            isActive(item.href)
                              ? "bg-white/15 text-white ring-1 ring-white/10"
                              : "text-slate-200 hover:bg-white/10 hover:text-white"
                          } ${collapsed ? "justify-center lg:px-2" : ""}`}
                        >
                          <Icon className="h-4 w-4 shrink-0 opacity-90 transition group-hover:opacity-100" />
                          <span className={collapsed ? "hidden lg:hidden" : "truncate"}>{item.label}</span>
                          {!collapsed ? <ChevronRight className="ml-auto h-3.5 w-3.5 opacity-50" /> : null}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>
          </div>
        </aside>
        <main className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
