"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, BarChart3, Command, Home, LayoutGrid, Layers3, Package2, Settings2, ShoppingCart, Shield, Sparkles } from "lucide-react";

type NavItem = {
  label: string;
  href: string;
};

type NavGroup = {
  label: string;
  items: NavItem[];
};

type QuickAction = {
  label: string;
  href: string;
  shortcut?: string;
};

type RecentRoute = {
  href: string;
  label: string;
};

const navGroups: NavGroup[] = [
  {
    label: "Tổng quan",
    items: [
      { label: "Bảng điều khiển", href: "/admin" },
      { label: "Analytics", href: "/admin/analytics" },
      { label: "Nhật ký audit", href: "/admin/audit" }
    ]
  },
  {
    label: "Tác vụ hằng ngày",
    items: [
      { label: "Đơn chờ payment", href: "/admin/orders?paymentStatus=pending" },
      { label: "Chưa fulfillment", href: "/admin/orders?fulfillmentStatus=unfulfilled" },
      { label: "Thanh toán lỗi", href: "/admin/payments?status=failed" },
      { label: "License trống", href: "/admin/license-keys?status=available" },
      { label: "Webhook lỗi", href: "/admin/webhooks?status=failed" }
    ]
  },
  {
    label: "Bán hàng",
    items: [
      { label: "Đơn hàng", href: "/admin/orders" },
      { label: "Thanh toán", href: "/admin/payments" },
      { label: "Gói license", href: "/admin/license-plans" },
      { label: "License keys", href: "/admin/license-keys" },
      { label: "Gói donate", href: "/admin/donate-packages" },
      { label: "Coupons", href: "/admin/coupons" }
    ]
  },
  {
    label: "Nội dung",
    items: [
      { label: "Cài đặt site", href: "/admin/site-settings" },
      { label: "Quản lý media", href: "/admin/media" }
    ]
  },
  {
    label: "Hệ thống",
    items: [
      { label: "Webhooks", href: "/admin/webhooks" },
      { label: "Compliance", href: "/admin/compliance" },
      { label: "Hardening", href: "/admin/hardening" }
    ]
  }
];

const navItemIcons: Record<string, typeof Home> = {
  "/admin": Home,
  "/admin/analytics": BarChart3,
  "/admin/audit": Layers3,
  "/admin/orders": ShoppingCart,
  "/admin/payments": Package2,
  "/admin/license-plans": LayoutGrid,
  "/admin/license-keys": Package2,
  "/admin/donate-packages": Sparkles,
  "/admin/coupons": Settings2,
  "/admin/site-settings": Settings2,
  "/admin/media": LayoutGrid,
  "/admin/webhooks": Shield,
  "/admin/compliance": Shield,
  "/admin/hardening": Shield,
  "/admin/orders?paymentStatus=pending": ShoppingCart,
  "/admin/orders?fulfillmentStatus=unfulfilled": ShoppingCart,
  "/admin/payments?status=failed": Package2,
  "/admin/license-keys?status=available": Package2,
  "/admin/webhooks?status=failed": Shield
};

const quickActions: QuickAction[] = [
  { label: "Tổng quan", href: "/admin", shortcut: "G D" },
  { label: "Đơn hàng", href: "/admin/orders", shortcut: "G O" },
  { label: "License keys", href: "/admin/license-keys", shortcut: "G K" },
  { label: "Payments", href: "/admin/payments", shortcut: "G P" },
  { label: "Site settings", href: "/admin/site-settings", shortcut: "G S" },
  { label: "Media", href: "/admin/media", shortcut: "G M" },
  { label: "Audit", href: "/admin/audit", shortcut: "G A" },
  { label: "Webhooks", href: "/admin/webhooks", shortcut: "G W" },
  { label: "Hardening", href: "/admin/hardening", shortcut: "G H" },
  { label: "Đơn chờ payment", href: "/admin/orders?paymentStatus=pending", shortcut: "G 1" },
  { label: "Thanh toán lỗi", href: "/admin/payments?status=failed", shortcut: "G 2" },
  { label: "Webhook lỗi", href: "/admin/webhooks?status=failed", shortcut: "G 3" }
];

function formatBreadcrumb(pathname: string) {
  const parts = pathname.split("/").filter(Boolean).slice(1);
  const map: Record<string, string> = {
    admin: "Tổng quan",
    analytics: "Analytics",
    audit: "Audit",
    orders: "Đơn hàng",
    payments: "Payments",
    "license-plans": "License plans",
    "license-keys": "License keys",
    "donate-packages": "Donate packages",
    coupons: "Coupons",
    "site-settings": "Site settings",
    media: "Media",
    webhooks: "Webhooks",
    compliance: "Compliance"
  };

  if (parts.length === 0) return ["Admin", "Tổng quan"];
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

function getRouteInfo(pathname: string): RecentRoute {
  const known: Record<string, RecentRoute> = {
    "/admin": { href: "/admin", label: "Tổng quan" },
    "/admin/analytics": { href: "/admin/analytics", label: "Phân tích" },
    "/admin/audit": { href: "/admin/audit", label: "Nhật ký audit" },
    "/admin/orders": { href: "/admin/orders", label: "Đơn hàng" },
    "/admin/payments": { href: "/admin/payments", label: "Thanh toán" },
    "/admin/license-plans": { href: "/admin/license-plans", label: "License plans" },
    "/admin/license-keys": { href: "/admin/license-keys", label: "License keys" },
    "/admin/donate-packages": { href: "/admin/donate-packages", label: "Donate packages" },
    "/admin/coupons": { href: "/admin/coupons", label: "Coupons" },
    "/admin/site-settings": { href: "/admin/site-settings", label: "Cài đặt site" },
    "/admin/media": { href: "/admin/media", label: "Quản lý media" },
    "/admin/webhooks": { href: "/admin/webhooks", label: "Webhooks" },
    "/admin/compliance": { href: "/admin/compliance", label: "Compliance" },
    "/admin/hardening": { href: "/admin/hardening", label: "Hardening" },
    "/admin/orders?paymentStatus=pending": { href: "/admin/orders?paymentStatus=pending", label: "Đơn chờ payment" },
    "/admin/orders?fulfillmentStatus=unfulfilled": { href: "/admin/orders?fulfillmentStatus=unfulfilled", label: "Đơn chưa fulfillment" },
    "/admin/payments?status=failed": { href: "/admin/payments?status=failed", label: "Thanh toán lỗi" },
    "/admin/license-keys?status=available": { href: "/admin/license-keys?status=available", label: "License trống" },
    "/admin/webhooks?status=failed": { href: "/admin/webhooks?status=failed", label: "Webhook lỗi" }
  };

  return known[pathname] ?? {
    href: pathname,
    label: pathname.split("/").filter(Boolean).at(-1) ?? "Admin",
  };
}

export function AdminShell({ children }: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  const isAuthPage = pathname === "/admin/login" || pathname === "/admin/login-test";
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [sidebarQuery, setSidebarQuery] = useState("");
  const [recentRoutes, setRecentRoutes] = useState<RecentRoute[]>([]);
  const breadcrumbs = formatBreadcrumb(pathname);
  const currentRoute = getRouteInfo(pathname);
  const filteredActions = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const searchable = [...recentRoutes, ...quickActions];
    if (!normalized) return searchable;
    return searchable.filter((action) => {
      const haystack = `${action.label} ${action.href}`.toLowerCase();
      return haystack.includes(normalized);
    });
  }, [query, recentRoutes]);

  const filteredNavGroups = useMemo(() => {
    const normalized = sidebarQuery.trim().toLowerCase();
    if (!normalized) return navGroups;

    return navGroups
      .map((group) => ({
        ...group,
        items: group.items.filter((item) => {
          const haystack = `${item.label} ${item.href}`.toLowerCase();
          return haystack.includes(normalized);
        })
      }))
      .filter((group) => group.items.length > 0);
  }, [sidebarQuery]);

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

  useEffect(() => {
    const stored = window.localStorage.getItem("hangcu.admin.recentRoutes");
    if (!stored) return;

    try {
      const parsed = JSON.parse(stored) as RecentRoute[];
      if (Array.isArray(parsed)) {
        setRecentRoutes(parsed.slice(0, 6));
      }
    } catch {
      setRecentRoutes([]);
    }
  }, []);

  useEffect(() => {
    const nextRecent: RecentRoute[] = [
      currentRoute,
      ...recentRoutes.filter((route) => route.href !== currentRoute.href)
    ].slice(0, 6);
    setRecentRoutes(nextRecent);
    window.localStorage.setItem("hangcu.admin.recentRoutes", JSON.stringify(nextRecent));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentRoute.href]);

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[#f4f7fb] text-slate-950">
      <div className="grid min-h-screen lg:grid-cols-[260px_1fr]">
        <aside className="border-b border-white/10 bg-[#1d2435] text-slate-100 lg:border-b-0 lg:border-r lg:border-r-white/10">
          <div className="flex h-full flex-col">
            <div className="border-b border-white/10 px-5 py-5">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#5cc8ff]">Hang Cú VIP</p>
              <h1 className="mt-1 text-xl font-semibold tracking-tight">Admin</h1>
            </div>
            <nav className="flex-1 overflow-y-auto px-3 py-4">
              <div className="space-y-4">
                {filteredNavGroups.length === 0 ? (
                  <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-slate-300">
                    Không có mục phù hợp.
                  </div>
                ) : null}
                {filteredNavGroups.map((group) => (
                  <div key={group.label}>
                    <p className="px-2 text-[10px] font-semibold uppercase tracking-[0.35em] text-slate-400">
                      {group.label}
                    </p>
                    <div className="mt-1 space-y-1">
                      {group.items.map((item) => {
                        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                        const ItemIcon = navItemIcons[item.href] ?? Home;
                        return (
                          <Link
                            key={item.href}
                            href={item.href as any}
                            className={`flex items-center gap-3 rounded-2xl border px-3 py-2.5 transition ${
                              active
                                ? "border-[#58a6ff]/30 bg-[#2577f4] text-white shadow-[0_10px_30px_rgba(37,119,244,0.25)]"
                                : "border-transparent text-slate-200 hover:border-white/10 hover:bg-white/8"
                            }`}
                          >
                            <ItemIcon className="h-4 w-4 shrink-0" />
                            <p className="text-sm font-medium leading-tight">{item.label}</p>
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
          <header className="border-b border-slate-200 bg-white shadow-[0_1px_0_rgba(15,23,42,0.04)]">
            <div className="flex flex-col gap-3 px-6 py-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#2577f4]">
                  {breadcrumbs.join(" / ")}
                </p>
                <h2 className="mt-1 text-lg font-semibold">{currentRoute.label}</h2>
              </div>
            </div>
          </header>
          <main className="flex-1 px-6 py-8 lg:px-8">
            <div className="mx-auto max-w-[1600px]">{children}</div>
          </main>
        </div>
      </div>

      {isPaletteOpen ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-950/45 px-4 py-10 backdrop-blur-sm">
          <div className="w-full max-w-2xl overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-center gap-3 border-b border-slate-200 px-4 py-4">
              <Command className="h-5 w-5 text-slate-400" />
              <input
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Tìm trang và hành động..."
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
              {recentRoutes.length > 0 ? (
                <>
                  <div className="px-3 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Recent</div>
                  <div className="grid gap-2 p-1">
                    {recentRoutes.map((route) => (
                      <Link
                        key={route.href}
                        href={route.href as any}
                        onClick={() => setIsPaletteOpen(false)}
                        className="rounded-2xl border border-slate-200 px-4 py-3 hover:border-blue-300 hover:bg-blue-50"
                      >
                        <p className="text-sm font-medium text-slate-900">{route.label}</p>
                      </Link>
                    ))}
                  </div>
                </>
              ) : null}

              <div className="px-3 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Actions</div>
              <div className="grid gap-2 p-1">
                {filteredActions.map((action) => (
                  <Link
                    key={action.href}
                    href={action.href as any}
                    onClick={() => setIsPaletteOpen(false)}
                    className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3 text-left hover:border-blue-300 hover:bg-blue-50"
                  >
                    <p className="text-sm font-medium text-slate-900">{action.label}</p>
                    <div className="flex items-center gap-3">
                      {"shortcut" in action ? (
                        <span className="rounded-full border border-slate-200 px-2 py-1 text-[10px] font-medium text-slate-500">
                          {String(action.shortcut)}
                        </span>
                      ) : null}
                      <ArrowRight className="h-4 w-4 text-slate-400" />
                    </div>
                  </Link>
                ))}
              </div>

              <div className="px-3 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Navigation</div>
              <div className="grid gap-2 p-1">
                {navGroups.flatMap((group) =>
                  group.items
                    .filter((item) => {
                      const normalized = query.trim().toLowerCase();
                      if (!normalized) return true;
                      return `${item.label} ${item.href}`.toLowerCase().includes(normalized);
                    })
                    .map((item) => (
                      <Link
                        key={item.href}
                        href={item.href as any}
                        onClick={() => setIsPaletteOpen(false)}
                        className="rounded-2xl border border-slate-200 px-4 py-3 hover:border-blue-300 hover:bg-blue-50"
                      >
                        <p className="text-sm font-medium text-slate-900">{item.label}</p>
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
