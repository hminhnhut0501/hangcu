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

type RecentRoute = {
  href: string;
  label: string;
  description: string;
};

const navGroups: NavGroup[] = [
  {
    label: "Tổng quan",
    items: [
      { label: "Bảng điều khiển", href: "/admin", description: "Tổng hợp vận hành và lối tắt." },
      { label: "Analytics", href: "/admin/analytics", description: "Xu hướng, chuyển đổi và fulfillment." },
      { label: "Nhật ký audit", href: "/admin/audit", description: "Theo dõi thao tác admin và hệ thống." }
    ]
  },
  {
    label: "Tác vụ hằng ngày",
    items: [
      { label: "Đơn chờ payment", href: "/admin/orders?paymentStatus=pending", description: "Đơn chưa thanh toán." },
      { label: "Chưa fulfillment", href: "/admin/orders?fulfillmentStatus=unfulfilled", description: "Đơn chờ cấp license." },
      { label: "Thanh toán lỗi", href: "/admin/payments?status=failed", description: "Kiểm tra lỗi từ cổng thanh toán." },
      { label: "License trống", href: "/admin/license-keys?status=available", description: "Xem license key sẵn sàng cấp." },
      { label: "Webhook lỗi", href: "/admin/webhooks?status=failed", description: "Thử lại webhook thất bại." }
    ]
  },
  {
    label: "Bán hàng",
    items: [
      { label: "Đơn hàng", href: "/admin/orders", description: "Quản lý đơn và fulfillment." },
      { label: "Thanh toán", href: "/admin/payments", description: "Xem event payment và thử lại." },
      { label: "Gói license", href: "/admin/license-plans", description: "Sửa gói 30 ngày và trọn đời." },
      { label: "License keys", href: "/admin/license-keys", description: "Cấp, thu hồi và xem chi tiết key." },
      { label: "Gói donate", href: "/admin/donate-packages", description: "Quản lý gói tặng license." },
      { label: "Coupons", href: "/admin/coupons", description: "Quản lý mã giảm giá." }
    ]
  },
  {
    label: "Nội dung",
    items: [
      { label: "Cài đặt site", href: "/admin/site-settings", description: "Hero, menu, footer, FAQ." },
      { label: "Quản lý media", href: "/admin/media", description: "Tải lên và sắp xếp hình ảnh." }
    ]
  },
  {
    label: "Hệ thống",
    items: [
      { label: "Webhooks", href: "/admin/webhooks", description: "Kiểm tra và thử lại event." },
      { label: "Compliance", href: "/admin/compliance", description: "Checklist sẵn sàng merchant." },
      { label: "Hardening", href: "/admin/hardening", description: "CSRF, role và các lớp an toàn." }
    ]
  }
];

const quickActions: QuickAction[] = [
  { label: "Mở bảng điều khiển", description: "Quay lại trang tổng quan.", href: "/admin", shortcut: "G D" },
  { label: "Xem đơn hàng", description: "Mở queue đơn và bulk actions.", href: "/admin/orders", shortcut: "G O" },
  { label: "Xem license keys", description: "Xem vòng đời và thu hồi.", href: "/admin/license-keys", shortcut: "G K" },
  { label: "Mở payments", description: "Kiểm tra event payment và retry.", href: "/admin/payments", shortcut: "G P" },
  { label: "Sửa cài đặt site", description: "Cập nhật hero, menu và FAQ.", href: "/admin/site-settings", shortcut: "G S" },
  { label: "Mở media", description: "Tải lên và gán ảnh dùng chung.", href: "/admin/media", shortcut: "G M" },
  { label: "Xuất audit", description: "Xem và xuất audit log.", href: "/admin/audit", shortcut: "G A" },
  { label: "Mở webhooks", description: "Theo dõi callback và retry.", href: "/admin/webhooks", shortcut: "G W" },
  { label: "Hardening", description: "Xem trạng thái bảo vệ hệ thống.", href: "/admin/hardening", shortcut: "G H" },
  { label: "Đơn chờ payment", description: "Đi tới đơn chưa thanh toán.", href: "/admin/orders?paymentStatus=pending", shortcut: "G 1" },
  { label: "Thanh toán lỗi", description: "Đi tới event payment thất bại.", href: "/admin/payments?status=failed", shortcut: "G 2" },
  { label: "Webhook lỗi", description: "Đi tới event webhook thất bại.", href: "/admin/webhooks?status=failed", shortcut: "G 3" }
];

function formatBreadcrumb(pathname: string) {
  const parts = pathname.split("/").filter(Boolean).slice(1);
  const map: Record<string, string> = {
    admin: "Tổng quan",
    analytics: "Analytics",
    audit: "Nhật ký audit",
    orders: "Đơn hàng",
    payments: "Thanh toán",
    "license-plans": "License plans",
    "license-keys": "License keys",
    "donate-packages": "Donate packages",
    coupons: "Coupons",
    "site-settings": "Site settings",
    media: "Media manager",
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
    "/admin": { href: "/admin", label: "Tổng quan", description: "Tổng hợp vận hành và lối tắt." },
    "/admin/analytics": {
      href: "/admin/analytics",
      label: "Phân tích",
      description: "Xu hướng doanh thu, chuyển đổi và fulfillment."
    },
    "/admin/audit": { href: "/admin/audit", label: "Nhật ký audit", description: "Theo dõi thao tác admin và hệ thống." },
    "/admin/orders": { href: "/admin/orders", label: "Đơn hàng", description: "Quản lý đơn hàng và fulfillment." },
    "/admin/payments": { href: "/admin/payments", label: "Thanh toán", description: "Xem event payment và retry." },
    "/admin/license-plans": {
      href: "/admin/license-plans",
      label: "License plans",
      description: "Chỉnh gói 30 ngày và trọn đời."
    },
    "/admin/license-keys": {
      href: "/admin/license-keys",
      label: "License keys",
      description: "Issue, revoke, and inspect keys."
    },
    "/admin/donate-packages": {
      href: "/admin/donate-packages",
      label: "Donate packages",
      description: "Quản lý gói bonus license."
    },
    "/admin/coupons": { href: "/admin/coupons", label: "Coupons", description: "Control promotions and discounts." },
    "/admin/site-settings": {
      href: "/admin/site-settings",
      label: "Cài đặt site",
      description: "Hero, menu, FAQ."
    },
    "/admin/media": { href: "/admin/media", label: "Quản lý media", description: "Tải lên và sắp xếp ảnh." },
    "/admin/webhooks": { href: "/admin/webhooks", label: "Webhooks", description: "Inspect and retry provider events." },
    "/admin/compliance": {
      href: "/admin/compliance",
      label: "Compliance",
      description: "Checklist merchant và chính sách."
    },
    "/admin/hardening": {
      href: "/admin/hardening",
      label: "Hardening",
      description: "CSRF, role và lớp an toàn."
    },
    "/admin/orders?paymentStatus=pending": {
      href: "/admin/orders?paymentStatus=pending",
      label: "Đơn chờ payment",
      description: "Đơn đang chờ thanh toán."
    },
    "/admin/orders?fulfillmentStatus=unfulfilled": {
      href: "/admin/orders?fulfillmentStatus=unfulfilled",
      label: "Đơn chưa fulfillment",
      description: "Đơn đang chờ cấp license."
    },
    "/admin/payments?status=failed": {
      href: "/admin/payments?status=failed",
      label: "Thanh toán lỗi",
      description: "Điều tra lỗi từ provider."
    },
    "/admin/license-keys?status=available": {
      href: "/admin/license-keys?status=available",
      label: "License trống",
      description: "Xem license key sẵn sàng cấp."
    },
    "/admin/webhooks?status=failed": {
      href: "/admin/webhooks?status=failed",
      label: "Webhook lỗi",
      description: "Retry event provider bị lỗi."
    }
  };

  return known[pathname] ?? {
    href: pathname,
    label: pathname.split("/").filter(Boolean).at(-1) ?? "Admin",
    description: "Trang admin hiện tại."
  };
}

export function AdminShell({ children }: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  if (pathname === "/admin/login" || pathname === "/admin/login-test") {
    return <>{children}</>;
  }
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
      const haystack = `${action.label} ${action.description} ${action.href}`.toLowerCase();
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
          const haystack = `${item.label} ${item.description} ${item.href}`.toLowerCase();
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

  return (
    <div className="min-h-screen bg-[#f4f7fb] text-slate-950">
      <div className="grid min-h-screen lg:grid-cols-[304px_1fr]">
        <aside className="border-b border-white/10 bg-[#1d2435] text-slate-100 lg:border-b-0 lg:border-r lg:border-r-white/10">
          <div className="flex h-full flex-col">
            <div className="border-b border-white/10 px-6 py-6">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#5cc8ff]">Hang Cú VIP</p>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight">Vận hành</h1>
              <p className="mt-2 text-sm text-slate-300">Nhận diện nhanh, thao tác nhanh, kiểm soát rõ ràng.</p>
            </div>
            <div className="border-b border-white/10 px-6 py-4">
              <label className="block">
                <span className="text-xs uppercase tracking-[0.25em] text-slate-400">Tìm nhanh menu</span>
                <input
                  type="search"
                  value={sidebarQuery}
                  onChange={(event) => setSidebarQuery(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      setIsPaletteOpen(true);
                    }
                  }}
                  placeholder="Tìm section hoặc trang..."
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-400 outline-none ring-0 focus:border-[#58a6ff]"
                />
              </label>
            </div>
            <nav className="flex-1 overflow-y-auto px-4 py-5">
              <div className="space-y-5">
                {filteredNavGroups.length === 0 ? (
                  <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-slate-300">
                    No matching pages. Try a broader keyword or open the command palette.
                  </div>
                ) : null}
                {filteredNavGroups.map((group) => (
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
                            className={`block rounded-2xl border px-3 py-3 transition ${
                              active
                                ? "border-[#58a6ff]/30 bg-[#2577f4] text-white shadow-[0_10px_30px_rgba(37,119,244,0.25)]"
                                : "border-transparent text-slate-200 hover:border-white/10 hover:bg-white/8"
                            }`}
                          >
                            <p className="text-sm font-medium">{item.label}</p>
                            <p className={`mt-1 text-xs ${active ? "text-blue-100" : "text-slate-400"}`}>
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
          <header className="border-b border-slate-200 bg-white shadow-[0_1px_0_rgba(15,23,42,0.04)]">
            <div className="flex flex-col gap-4 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#2577f4]">
                  {breadcrumbs.join(" / ")}
                </p>
                <h2 className="mt-2 text-lg font-semibold">{currentRoute.label}</h2>
                <p className="mt-1 text-sm text-slate-500">{currentRoute.description}</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsPaletteOpen(true)}
                  className="inline-flex items-center gap-2 rounded-full border border-[#d9e7ff] bg-[#f7fbff] px-3 py-2 text-xs font-medium text-[#1c5fd4] hover:border-[#b8d3ff] hover:bg-white"
                >
                  <Search className="h-4 w-4" />
                  Quick jump
                  <span className="rounded-full border border-[#d9e7ff] bg-white px-2 py-0.5 text-[10px] text-slate-500">
                    Ctrl K
                  </span>
                </button>
                <p className="rounded-full border border-[#d9e7ff] bg-white px-3 py-2 text-xs text-slate-600">
                  Chỉ thao tác phía server
                </p>
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
                  <div className="px-3 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                    Recent pages
                  </div>
                  <div className="grid gap-2 p-1">
                    {recentRoutes.map((route) => (
                      <Link
                        key={route.href}
                        href={route.href as any}
                        onClick={() => setIsPaletteOpen(false)}
                        className="rounded-2xl border border-slate-200 px-4 py-3 hover:border-blue-300 hover:bg-blue-50"
                      >
                        <p className="text-sm font-medium text-slate-900">{route.label}</p>
                        <p className="text-xs text-slate-500">{route.description}</p>
                      </Link>
                    ))}
                  </div>
                </>
              ) : null}

              <div className="px-3 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                Shortcuts and pages
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
