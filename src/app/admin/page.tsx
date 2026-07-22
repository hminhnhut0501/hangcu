import Link from "next/link";
import { Box, Button, Card, CardContent, Chip, Typography } from "@mui/material";
import { getDashboardSummary } from "@/modules/dashboard/service";
import { getAnalyticsSummary } from "@/modules/analytics/service";

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

  const urgencyCards = [
    {
      label: "Đơn chờ payment",
      value: formatCount(summary.pendingOrdersCount),
      href: "/admin/orders?paymentStatus=pending",
      description: "Đơn đang chờ thanh toán hoặc xác nhận."
    },
    {
      label: "Webhook lỗi",
      value: formatCount(analytics.webhookErrorsCount),
      href: "/admin/webhooks?status=failed",
      description: "Kiểm tra callback lỗi và thử lại."
    },
    {
      label: "payment lỗi",
      value: formatCount(analytics.failedOrdersCount),
      href: "/admin/payments?status=failed",
      description: "Xem các event payment thất bại và dấu vết từ cổng thanh toán."
    },
    {
      label: "Chờ fulfillment",
      value: formatCount(analytics.fulfillmentPendingCount),
      href: "/admin/orders?fulfillmentStatus=unfulfilled",
      description: "Đơn đang chờ cấp license hoặc fulfillment."
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
      href: "/admin/orders?paymentStatus=pending",
      description: "Orders waiting for payment confirmation."
    },
    {
      label: "Unfulfilled orders",
      href: "/admin/orders?fulfillmentStatus=unfulfilled",
      description: "Orders waiting for license issuance."
    },
    {
      label: "Failed payments",
      href: "/admin/payments?status=failed",
      description: "Provider events that need a retry or review."
    },
    {
      label: "Available keys",
      href: "/admin/license-keys?status=available",
      description: "License keys ready to issue."
    }
  ];

  return (
    <section className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.3em] text-blue-600">Bảng điều khiển</p>
          <h2 className="mt-3 text-4xl font-semibold tracking-tight">Tổng quan admin</h2>
          <p className="mt-2 max-w-3xl text-sm text-slate-600">
            Màn vận hành gọn cho doanh thu, chuyển đổi, fulfillment và tình trạng vòng đời license.
          </p>
        </div>
        <Link
          href="/admin/analytics"
          className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
        >
          Mở analytics
        </Link>
      </div>

      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
        {urgencyCards.map((card) => (
          <Card
            key={card.label}
            component={Link}
            href={card.href as any}
            className="transition hover:-translate-y-0.5"
            sx={{
              background: "linear-gradient(180deg, #f3fff9 0%, #ffffff 100%)",
              borderColor: "#d7f2e9",
              "&:hover": {
                borderColor: "#9ae6c9",
                background: "#ffffff"
              }
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: "0.24em", color: "#047857" }}>
                  Cần xử lý
                </Typography>
                <Chip label="Live" size="small" sx={{ fontWeight: 700, bgcolor: "#d1fae5", color: "#047857" }} />
              </Box>
              <Typography sx={{ mt: 1.5, fontSize: 14, fontWeight: 600, color: "text.secondary" }}>{card.label}</Typography>
              <Typography sx={{ mt: 1, fontSize: 30, fontWeight: 700, letterSpacing: -0.5 }}>{card.value}</Typography>
              <Typography sx={{ mt: 1, fontSize: 14, lineHeight: 1.7, color: "text.secondary" }}>{card.description}</Typography>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_10px_35px_rgba(15,23,42,0.06)]">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#2577f4]">Tác vụ hằng ngày</p>
            <h3 className="mt-2 text-lg font-semibold">Việc cần xử lý hôm nay</h3>
          </div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Queue một chạm</p>
        </div>
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
                borderColor: "#dbeafe",
                bgcolor: "#f8fbff",
                color: "text.primary",
                px: 2,
                py: 1.5,
                textAlign: "left",
                "&:hover": { borderColor: "#93c5fd", bgcolor: "#ffffff" }
              }}
            >
              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, alignItems: "flex-start" }}>
                <Typography sx={{ fontSize: 14, fontWeight: 600 }}>{item.label}</Typography>
                <Typography sx={{ fontSize: 12, color: "text.secondary" }}>{item.description}</Typography>
              </Box>
            </Button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-600">Operational queues</p>
              <h3 className="mt-2 text-lg font-semibold">What to work on next</h3>
            </div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Thao tác nhanh</p>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {attentionLinks.map((item) => (
              <Button
                key={item.href}
                component={Link}
                href={item.href as any}
                variant="outlined"
                sx={{
                  justifyContent: "flex-start",
                  alignItems: "flex-start",
                  bgcolor: "#f8fafc",
                  borderColor: "#e2e8f0",
                  color: "text.primary",
                  px: 2,
                  py: 1.5,
                  textAlign: "left",
                  "&:hover": { borderColor: "#93c5fd", bgcolor: "#eff6ff" }
                }}
              >
                <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, alignItems: "flex-start" }}>
                  <Typography sx={{ fontSize: 14, fontWeight: 600 }}>{item.label}</Typography>
                  <Typography sx={{ fontSize: 12, color: "text.secondary" }}>Mở hàng đợi đã lọc</Typography>
                </Box>
              </Button>
            ))}
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-slate-700">Xu hướng doanh thu</p>
              <div className="mt-3 space-y-3">
                {revenueTrend.map((bar) => (
                  <div key={bar.label} className="grid grid-cols-[48px_1fr_56px] items-center gap-3 text-sm">
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
              <p className="text-sm font-medium text-slate-700">Xu hướng đơn hàng</p>
              <div className="mt-3 space-y-3">
                {orderTrend.map((bar) => (
                  <div key={bar.label} className="grid grid-cols-[48px_1fr_56px] items-center gap-3 text-sm">
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
            <h3 className="text-lg font-semibold">Tín hiệu sức khỏe</h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              <li>Tỷ lệ chuyển đổi: {formatPercent(analytics.conversionRate)}</li>
              <li>Tỷ lệ fulfillment: {formatPercent(analytics.fulfillmentRate)}</li>
              <li>AOV: {currencyFormat.format(analytics.averageOrderValueMinor / 100)}</li>
              <li>Đơn refunded: {analytics.refundedOrdersCount}</li>
              <li>Đơn lỗi: {analytics.failedOrdersCount}</li>
              <li>Fulfillment chờ: {analytics.fulfillmentPendingCount}</li>
            </ul>
          </article>

          <article className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_10px_35px_rgba(15,23,42,0.06)]">
            <h3 className="text-lg font-semibold">Điều hướng nhanh</h3>
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
          <h3 className="text-lg font-semibold">Việc nên làm tiếp</h3>
          <ul className="mt-4 space-y-2 text-sm text-slate-600">
            <li>Theo dõi doanh thu tuần và xu hướng đơn trước khi chạy campaign mới.</li>
            <li>Xem đơn chờ và webhook lỗi cùng lúc khi ticket support tăng.</li>
            <li>Dùng trang compliance trước khi nộp duyệt payment hoặc đổi policy lớn.</li>
          </ul>
        </article>
        <article className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_10px_35px_rgba(15,23,42,0.06)]">
          <h3 className="text-lg font-semibold">Trạng thái hardening</h3>
          <ul className="mt-4 space-y-2 text-sm text-slate-600">
            <li>Đã có guard phía server cho toàn bộ admin surface.</li>
            <li>Có audit logging cho các mutation.</li>
            <li>Có màn theo dõi và retry webhook.</li>
          </ul>
        </article>
      </div>
    </section>
  );
}
