"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Command, Search } from "lucide-react";

type NavItem = {
  label: string;
  href: string;
  description: string;
};

type NavGroup = {
  label: string;
  items: NavItem[];
};

type QuickAction = {
  label: string;
  description: string;
  href: string;
  shortcut?: string;
};

const navGroups: NavGroup[] = [
  {
    label: "Overview",
    items: [
      { label: "Dashboard", href: "/admin", description: "Operational summary and shortcuts." },
      { label: "Analytics", href: "/admin/analytics", description: "Trends, conversion, and fulfillment insights." },
      { label: "Audit log", href: "/admin/audit", description: "Track admin and system actions." }
    ]
  },
  {
    label: "Commerce",
    items: [
      { label: "Orders", href: "/admin/orders", description: "Manage customer orders and fulfillment." },
      { label: "Payments", href: "/admin/payments", description: "Review payment events and retries." },
      { label: "License plans", href: "/admin/license-plans", description: "Edit 30-day and lifetime plans." },
      { label: "License keys", href: "/admin/license-keys", description: "Issue, revoke, and inspect keys." },
      { label: "Donate packages", href: "/admin/donate-packages", description: "Manage bonus-license packages." },
      { label: "Coupons", href: "/admin/coupons", description: "Control promotions and discounts." }
    ]
  },
  {
    label: "Content",
    items: [
      { label: "Site settings", href: "/admin/site-settings", description: "Homepage copy, menus, FAQ." },
      { label: "Media manager", href: "/admin/media", description: "Upload and organize images." }
    ]
  },
  {
    label: "System",
    items: [
      { label: "Webhooks", href: "/admin/webhooks", description: "Inspect and retry provider events." },
      { label: "Compliance", href: "/admin/compliance", description: "Merchant readiness and policy checklist." }
    ]
  }
];

const quickActions: QuickAction[] = [
  { label: "Open dashboard", description: "Return to the overview board.", href: "/admin", shortcut: "G D" },
  { label: "View orders", description: "Inspect order queue and bulk actions.", href: "/admin/orders", shortcut: "G O" },
  { label: "View license keys", description: "Review lifecycle and revocations.", href: "/admin/license-keys", shortcut: "G K" },
  { label: "Open payments", description: "Check provider events and retries.", href: "/admin/payments", shortcut: "G P" },
  { label: "Edit site settings", description: "Update homepage content and menus.", href: "/admin/site-settings", shortcut: "G S" },
  { label: "Open media manager", description: "Upload and assign shared images.", href: "/admin/media", shortcut: "G M" },
  { label: "Audit export", description: "Review and export audit logs.", href: "/admin/audit", shortcut: "G A" },
  { label: "Open webhooks", description: "Monitor provider callbacks and retries.", href: "/admin/webhooks", shortcut: "G W" }
];

function formatBreadcrumb(pathname: string) {
  const parts = pathname.split("/").filter(Boolean).slice(1);
  const map: Record<string, string> = {
    admin: "Dashboard",
    analytics: "Analytics",
    audit: "Audit log",
    orders: "Orders",
    payments: "Payments",
    "license-plans": "License plans",
    "license-keys": "License keys",
    "donate-packages": "Donate packages",
    coupons: "Coupons",
    "site-settings": "Site settings",
    media: "Media manager",
    webhooks: "Webhooks",
    compliance: "Compliance"
  };

  if (parts.length === 0) return ["Admin", "Dashboard"];
  return [
    "Admin",
    ...(parts.map((part, index) => {
      if (index === 1 && parts[0] === "orders") {
        return /^ORD-/i.test(part) ? part : map[part] ?? part;
      }
      return map[part] ?? part;
    }))
  ];
}

export function AdminShell({ children }: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [query, setQuery] = useState("");
  const breadcrumbs = formatBreadcrumb(pathname);
  const filteredActions = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return quickActions;
    return quickActions.filter((action) => {
      const haystack = `${action.label} ${action.description} ${action.href}`.toLowerCase();
      return haystack.includes(normalized);
    });
  }, [query]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const isMetaOrCtrl = event.metaKey || event.ctrlKey;
      if (isMetaOrCtrl && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setIsPaletteOpen((current) => !current);
      }
      if (event.key === "Escape") {
        setIsPaletteOpen(false);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
        <aside className="border-b border-slate-200 bg-slate-950 text-slate-100 lg:border-b-0 lg:border-r">
          <div className="flex h-full flex-col">
            <div className="border-b border-white/10 px-6 py-6">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-blue-300">Admin</p>
              <h1 className="mt-2 text-xl font-semibold">Control Panel</h1>
              <p className="mt-2 text-sm text-slate-300">Operations, content, and compliance.</p>
            </div>
            <div className="border-b border-white/10 px-6 py-4">
              <label className="block">
                <span className="text-xs uppercase tracking-[0.25em] text-slate-400">Search</span>
                <input
                  type="search"
                  value=""
                  readOnly
                  onClick={() => setIsPaletteOpen(true)}
                  onFocus={() => setIsPaletteOpen(true)}
                  placeholder="Search admin... / Ctrl K"
                  className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-400 outline-none ring-0 focus:border-blue-400"
                />
              </label>
            </div>
            <nav className="flex-1 overflow-y-auto px-4 py-5">
              <div className="space-y-5">
                {navGroups.map((group) => (
                  <div key={group.label}>
                    <p className="px-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                      {group.label}
                    </p>
                    <div className="mt-2 space-y-1">
                      {group.items.map((item) => {
                        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                        return (
                          <Link
                            key={item.href}
                            href={item.href as any}
                            className={`block rounded-2xl px-3 py-3 transition ${
                              active ? "bg-white text-slate-950" : "text-slate-200 hover:bg-white/10"
                            }`}
                          >
                            <p className="text-sm font-medium">{item.label}</p>
                            <p className={`mt-1 text-xs ${active ? "text-slate-600" : "text-slate-400"}`}>
                              {item.description}
                            </p>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </nav>
          </div>
        </aside>

        <div className="flex min-w-0 flex-col">
          <header className="border-b border-slate-200 bg-white">
            <div className="flex flex-col gap-4 px-6 py-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-blue-600">
                  {breadcrumbs.join(" / ")}
                </p>
                <h2 className="mt-2 text-lg font-semibold">
                  {pathname === "/admin"
                    ? "Admin overview"
                    : breadcrumbs[breadcrumbs.length - 1]}
                </h2>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsPaletteOpen(true)}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 hover:border-slate-300 hover:bg-white"
                >
                  <Search className="h-4 w-4" />
                  Command palette
                  <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] text-slate-500">
                    Ctrl K
                  </span>
                </button>
                <p className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
                  Server-side only operations
                </p>
              </div>
            </div>
          </header>
          <main className="flex-1 px-6 py-8 lg:px-8">{children}</main>
        </div>
      </div>

      {isPaletteOpen ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-950/40 px-4 py-10 backdrop-blur-sm">
          <div className="w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-center gap-3 border-b border-slate-200 px-4 py-4">
              <Command className="h-5 w-5 text-slate-400" />
              <input
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search pages and actions..."
                className="w-full border-0 bg-transparent text-sm outline-none placeholder:text-slate-400"
              />
              <button
                type="button"
                onClick={() => setIsPaletteOpen(false)}
                className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600"
              >
                Esc
              </button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto p-2">
              <div className="px-3 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                Shortcuts
              </div>
              <div className="grid gap-2 p-1">
                {filteredActions.map((action) => (
                  <Link
                    key={action.href}
                    href={action.href as any}
                    onClick={() => setIsPaletteOpen(false)}
                    className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3 text-left hover:border-blue-300 hover:bg-blue-50"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-900">{action.label}</p>
                      <p className="text-xs text-slate-500">{action.description}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      {action.shortcut ? (
                        <span className="rounded-full border border-slate-200 px-2 py-1 text-[10px] font-medium text-slate-500">
                          {action.shortcut}
                        </span>
                      ) : null}
                      <ArrowRight className="h-4 w-4 text-slate-400" />
                    </div>
                  </Link>
                ))}
              </div>

              <div className="px-3 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                Navigation
              </div>
              <div className="grid gap-2 p-1">
                {navGroups.flatMap((group) =>
                  group.items
                    .filter((item) => {
                      const normalized = query.trim().toLowerCase();
                      if (!normalized) return true;
                      return `${item.label} ${item.description} ${item.href}`.toLowerCase().includes(normalized);
                    })
                    .map((item) => (
                      <Link
                        key={item.href}
                        href={item.href as any}
                        onClick={() => setIsPaletteOpen(false)}
                        className="rounded-2xl border border-slate-200 px-4 py-3 hover:border-blue-300 hover:bg-blue-50"
                      >
                        <p className="text-sm font-medium text-slate-900">{item.label}</p>
                        <p className="text-xs text-slate-500">{item.description}</p>
                      </Link>
                    ))
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
