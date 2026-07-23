import Link from "next/link";
import { Box, Button, Card, CardContent, Chip, Typography } from "@mui/material";
import { getDashboardSummary } from "@/modules/dashboard/service";
import { getAnalyticsSummary } from "@/modules/analytics/service";
import { hasSupabasePersistence } from "@/lib/db/persistence";

const currencyFormat = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD"
});

function formatPercent(value: number) {
  return `${(value * 100).toFixed(1)}%`;
}

function renderMiniBars(points: Array<[string, number]>, colorClass = "bg-blue-500") {
  const max = Math.max(1, ...points.map(([, value]) => value));
  return points.map(([label, value]) => ({
    label,
    width: `${Math.max(6, Math.round((value / max) * 100))}%`,
    colorClass,
    value
  }));
}

function formatCount(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

export default async function AdminHomePage() {
  const [summary, analytics] = await Promise.all([getDashboardSummary(), getAnalyticsSummary()]);
  const supabaseConnected = hasSupabasePersistence();
  const webhookHealthy = analytics.webhookErrorsCount === 0;
  const paymentHealthy = analytics.failedOrdersCount === 0;
  const licenseHealthy = analytics.licenseKeyAvailableCount > 0 || summary.licenseKeyRemaining > 0;
  const statusCards = [
    {
      label: "DB / Supabase",
      value: supabaseConnected ? "Đã nối" : "Chưa nối",
      hint: supabaseConnected ? "Đang đọc dữ liệu thật hoặc fallback an toàn." : "Đang chạy seed nội bộ.",
      tone: supabaseConnected ? "success" : "warning"
    },
    {
      label: "Webhook",
      value: webhookHealthy ? "Ổn" : `${analytics.webhookErrorsCount} lỗi`,
      hint: webhookHealthy ? "Không thấy event lỗi." : "Có event payment/webhook chưa xử lý xong.",
      tone: webhookHealthy ? "success" : "danger"
    },
    {
      label: "Thanh toán",
      value: paymentHealthy ? "Ổn" : `${analytics.failedOrdersCount} lỗi`,
      hint: paymentHealthy ? "Chưa thấy đơn payment thất bại." : "Có đơn/payment event đang lỗi.",
      tone: paymentHealthy ? "success" : "danger"
    },
    {
      label: "License",
      value: licenseHealthy ? "Sẵn" : "Thiếu",
      hint: licenseHealthy ? "Có key khả dụng hoặc dữ liệu license đang có." : "Chưa có key khả dụng.",
      tone: licenseHealthy ? "success" : "warning"
    }
  ] as const;

  const urgencyCards = [
    {
      label: "Đơn chờ payment",
      value: formatCount(summary.pendingOrdersCount),
      href: "/admin/orders?paymentStatus=pending",
    },
    {
      label: "Webhook lỗi",
      value: formatCount(analytics.webhookErrorsCount),
      href: "/admin/webhooks?status=failed",
    },
    {
      label: "payment lỗi",
      value: formatCount(analytics.failedOrdersCount),
      href: "/admin/payments?status=failed",
    },
    {
      label: "Chờ fulfillment",
      value: formatCount(analytics.fulfillmentPendingCount),
      href: "/admin/orders?fulfillmentStatus=unfulfilled",
    }
  ];

  const orderTrend = renderMiniBars(analytics.dailyOrderCount.slice(-7).map(([day, value]) => [day.slice(5), value] as [string, number]), "bg-slate-900");
  const revenueTrend = renderMiniBars(analytics.dailyRevenue.slice(-7).map(([day, value]) => [day.slice(5), Math.round(value / 100)] as [string, number]), "bg-blue-500");
  const attentionLinks = [
    { label: "Queue đơn hàng", href: "/admin/orders" },
    { label: "Queue payments", href: "/admin/payments" },
    { label: "License keys", href: "/admin/license-keys" },
    { label: "Giám sát webhook", href: "/admin/webhooks" },
    { label: "Audit log", href: "/admin/audit" },
    { label: "Hardening", href: "/admin/hardening" }
  ];

  const dailyOps = [
    {
      label: "Pending orders",
      href: "/admin/orders?paymentStatus=pending"
    },
    {
      label: "Unfulfilled orders",
      href: "/admin/orders?fulfillmentStatus=unfulfilled"
    },
    {
      label: "Failed payments",
      href: "/admin/payments?status=failed"
    },
    {
      label: "Available keys",
      href: "/admin/license-keys?status=available"
    }
  ];

  return (
    <section className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-4xl font-semibold tracking-tight">Tổng quan admin</h2>
          <p className="mt-2 max-w-3xl text-sm text-slate-600">
            Báo cáo ngắn gọn trạng thái hệ thống, để nhìn nhanh biết phần nào đang hoạt động, phần nào cần kiểm tra.
          </p>
        </div>
        <Link
          href="/admin/analytics"
          className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 shadow-[0_8px_24px_rgba(15,23,42,0.04)] transition hover:border-slate-300 hover:bg-slate-50"
        >
          Mở analytics
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statusCards.map((card) => (
          <article
            key={card.label}
            className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.05)]"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold text-slate-500">{card.label}</p>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  card.tone === "success"
                    ? "bg-emerald-100 text-emerald-700"
                    : card.tone === "danger"
                      ? "bg-rose-100 text-rose-700"
                      : "bg-amber-100 text-amber-700"
                }`}
              >
                {card.value}
              </span>
            </div>
            <p className="mt-3 text-sm font-medium text-slate-900">{card.value}</p>
            <p className="mt-1 text-sm text-slate-600">{card.hint}</p>
          </article>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
        {urgencyCards.map((card) => (
          <Card
            key={card.label}
            component={Link}
            href={card.href as any}
            className="transition duration-200 hover:-translate-y-0.5"
            sx={{
              background: "linear-gradient(180deg, #f3fff9 0%, #ffffff 100%)",
              borderColor: "#d7f2e9",
              boxShadow: "0 8px 28px rgba(15, 23, 42, 0.04)",
              "&:hover": {
                borderColor: "#9ae6c9",
                background: "#ffffff",
                boxShadow: "0 10px 32px rgba(15, 23, 42, 0.06)"
              }
            }}
          >
          <CardContent sx={{ p: 2.75 }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
                <Chip label="Live" size="small" sx={{ height: 22, fontWeight: 700, bgcolor: "#d1fae5", color: "#047857" }} />
              </Box>
              <Typography sx={{ mt: 1.25, fontSize: 14, fontWeight: 600, color: "text.secondary" }}>{card.label}</Typography>
              <Typography sx={{ mt: 0.75, fontSize: 30, fontWeight: 700, letterSpacing: -0.5 }}>{card.value}</Typography>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_10px_35px_rgba(15,23,42,0.06)]">
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {dailyOps.map((item) => (
            <Button
              key={item.href}
              component={Link}
              href={item.href as any}
              variant="outlined"
              sx={{
                justifyContent: "flex-start",
                alignItems: "flex-start",
                minHeight: 64,
                borderColor: "#dbeafe",
                bgcolor: "#f8fbff",
                color: "text.primary",
                px: 2,
                py: 1.25,
                textAlign: "left",
                boxShadow: "0 6px 18px rgba(15, 23, 42, 0.03)",
                transition: "transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease, background-color 160ms ease",
                "&:hover": { borderColor: "#93c5fd", bgcolor: "#ffffff", boxShadow: "0 10px 24px rgba(15, 23, 42, 0.05)", transform: "translateY(-1px)" }
              }}
            >
              <Typography sx={{ fontSize: 14, fontWeight: 600, lineHeight: 1.25 }}>{item.label}</Typography>
            </Button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mt-2 grid gap-4 sm:grid-cols-2">
            {attentionLinks.map((item) => (
              <Button
                key={item.href}
                component={Link}
                href={item.href as any}
                variant="outlined"
                sx={{
                  justifyContent: "flex-start",
                  alignItems: "flex-start",
                  minHeight: 60,
                  bgcolor: "#f8fafc",
                  borderColor: "#e2e8f0",
                  color: "text.primary",
                  px: 2,
                  py: 1.25,
                  textAlign: "left",
                  boxShadow: "0 6px 18px rgba(15, 23, 42, 0.03)",
                  transition: "transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease, background-color 160ms ease",
                  "&:hover": { borderColor: "#93c5fd", bgcolor: "#eff6ff", boxShadow: "0 10px 24px rgba(15, 23, 42, 0.05)", transform: "translateY(-1px)" }
                }}
              >
                <Typography sx={{ fontSize: 14, fontWeight: 600, lineHeight: 1.25 }}>{item.label}</Typography>
              </Button>
            ))}
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-slate-700">Doanh thu</p>
              <div className="mt-3 space-y-2">
                {revenueTrend.map((bar) => (
                  <div key={bar.label} className="grid grid-cols-[40px_1fr_56px] items-center gap-2 text-xs">
                    <span className="text-slate-500">{bar.label}</span>
                    <div className="h-2 rounded-full bg-slate-100">
                      <div className={`h-2 rounded-full ${bar.colorClass}`} style={{ width: bar.width }} />
                    </div>
                    <span className="text-right font-medium">{currencyFormat.format(bar.value)}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-700">Đơn hàng</p>
              <div className="mt-3 space-y-2">
                {orderTrend.map((bar) => (
                  <div key={bar.label} className="grid grid-cols-[40px_1fr_56px] items-center gap-2 text-xs">
                    <span className="text-slate-500">{bar.label}</span>
                    <div className="h-2 rounded-full bg-slate-100">
                      <div className={`h-2 rounded-full ${bar.colorClass}`} style={{ width: bar.width }} />
                    </div>
                    <span className="text-right font-medium">{bar.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </article>

        <div className="space-y-6">
          <article className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_10px_35px_rgba(15,23,42,0.06)]">
            <h3 className="text-lg font-semibold">Tín hiệu</h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              <li>Tỷ lệ chuyển đổi: {formatPercent(analytics.conversionRate)}</li>
              <li>Tỷ lệ fulfillment: {formatPercent(analytics.fulfillmentRate)}</li>
              <li>AOV: {currencyFormat.format(analytics.averageOrderValueMinor / 100)}</li>
            </ul>
          </article>

          <article className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_10px_35px_rgba(15,23,42,0.06)]">
            <h3 className="text-lg font-semibold">Điều hướng</h3>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {[
                { label: "Orders", href: "/admin/orders" },
                { label: "Thanh toán", href: "/admin/payments" },
                { label: "License keys", href: "/admin/license-keys" },
                { label: "Webhook log", href: "/admin/webhooks" },
                { label: "Nhật ký audit", href: "/admin/audit" },
                { label: "Compliance", href: "/admin/compliance" },
                { label: "Hardening", href: "/admin/hardening" }
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href as any}
                  className="rounded-3xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 hover:border-[#93c5fd] hover:bg-[#f8fbff]"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </article>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <article className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_10px_35px_rgba(15,23,42,0.06)]">
          <h3 className="text-lg font-semibold">Gợi ý</h3>
          <ul className="mt-4 space-y-2 text-sm text-slate-600">
            <li>Theo dõi doanh thu tuần.</li>
            <li>Xem đơn chờ và webhook lỗi.</li>
            <li>Dùng compliance trước khi đổi policy.</li>
          </ul>
        </article>
        <article className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_10px_35px_rgba(15,23,42,0.06)]">
          <h3 className="text-lg font-semibold">Hardening</h3>
          <ul className="mt-4 space-y-2 text-sm text-slate-600">
            <li>Guard phía server.</li>
            <li>Audit logging.</li>
            <li>Retry webhook.</li>
          </ul>
        </article>
      </div>
    </section>
  );
}
