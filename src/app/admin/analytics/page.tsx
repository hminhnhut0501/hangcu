import { getAnalyticsSummary } from "@/modules/analytics/service";

const currencyFormat = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "USD"
});

function formatPercent(value: number) {
  return `${(value * 100).toFixed(1)}%`;
}

export default async function AdminAnalyticsPage() {
  const analytics = await getAnalyticsSummary();

  return (
    <section className="space-y-8">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.3em] text-blue-600">Tổng quan</p>
        <h2 className="mt-3 text-4xl font-semibold tracking-tight">Phân tích vận hành</h2>
        <p className="mt-2 max-w-3xl text-sm text-slate-600">
          Doanh thu, chuyển đổi, fulfillment và sức khỏe vận hành của storefront và vòng đời license.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_10px_35px_rgba(15,23,42,0.05)]">
          <p className="text-sm text-slate-500">Doanh thu tháng</p>
          <p className="mt-3 text-3xl font-semibold">{currencyFormat.format(analytics.monthRevenueMinor / 100)}</p>
        </article>
        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_10px_35px_rgba(15,23,42,0.05)]">
          <p className="text-sm text-slate-500">Doanh thu tuần</p>
          <p className="mt-3 text-3xl font-semibold">{currencyFormat.format(analytics.weekRevenueMinor / 100)}</p>
        </article>
        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_10px_35px_rgba(15,23,42,0.05)]">
          <p className="text-sm text-slate-500">Chuyển đổi</p>
          <p className="mt-3 text-3xl font-semibold">{formatPercent(analytics.conversionRate)}</p>
        </article>
        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_10px_35px_rgba(15,23,42,0.05)]">
          <p className="text-sm text-slate-500">Fulfillment</p>
          <p className="mt-3 text-3xl font-semibold">{formatPercent(analytics.fulfillmentRate)}</p>
        </article>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_10px_35px_rgba(15,23,42,0.05)]">
          <h3 className="text-lg font-semibold">Doanh thu theo ngày</h3>
          <div className="mt-4 space-y-3">
            {analytics.dailyRevenue.length === 0 ? (
              <p className="text-sm text-slate-500">Chưa có dữ liệu doanh thu kèm thời gian.</p>
            ) : (
              analytics.dailyRevenue.map(([day, value]) => (
                <div key={day} className="grid grid-cols-[92px_1fr_96px] items-center gap-3 text-sm">
                  <span className="text-slate-500">{day}</span>
                  <div className="h-2 rounded-full bg-slate-100">
                    <div
                      className="h-2 rounded-full bg-blue-500"
                      style={{
                        width: `${Math.max(
                          8,
                          Math.round((value / Math.max(...analytics.dailyRevenue.map(([, amount]) => amount), 1)) * 100)
                        )}%`
                      }}
                    />
                  </div>
                  <span className="text-right font-medium">{currencyFormat.format(value / 100)}</span>
                </div>
              ))
            )}
          </div>
        </article>

        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_10px_35px_rgba(15,23,42,0.05)]">
          <h3 className="text-lg font-semibold">Tín hiệu vận hành</h3>
          <ul className="mt-4 space-y-3 text-sm text-slate-600">
            <li>Đơn hôm nay: {analytics.todayOrderCount}</li>
            <li>Đơn tuần này: {analytics.weekOrderCount}</li>
            <li>Đơn tháng này: {analytics.monthOrderCount}</li>
            <li>Giá trị đơn trung bình: {currencyFormat.format(analytics.averageOrderValueMinor / 100)}</li>
            <li>Đơn chờ: {analytics.pendingOrdersCount}</li>
            <li>Đơn hoàn tiền: {analytics.refundedOrdersCount}</li>
            <li>Lỗi webhook: {analytics.webhookErrorsCount}</li>
            <li>Sự kiện audit: {analytics.auditEventsCount}</li>
          </ul>
        </article>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_10px_35px_rgba(15,23,42,0.05)]">
          <h3 className="text-lg font-semibold">Tồn kho license</h3>
          <ul className="mt-4 space-y-2 text-sm text-slate-600">
            <li>Sẵn sàng: {analytics.licenseKeyAvailableCount}</li>
            <li>Đã cấp: {analytics.licenseKeyIssuedCount}</li>
            <li>Đã redeem: {analytics.licenseKeyRedeemedCount}</li>
          </ul>
        </article>
        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_10px_35px_rgba(15,23,42,0.05)]">
          <h3 className="text-lg font-semibold">Hành động audit gần đây</h3>
          <ul className="mt-4 space-y-2 text-sm text-slate-600">
            {Object.entries(analytics.auditByAction)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 5)
              .map(([action, count]) => (
                <li key={action} className="flex items-center justify-between gap-3">
                  <span>{action}</span>
                  <span className="font-medium">{count}</span>
                </li>
              ))}
          </ul>
        </article>
        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_10px_35px_rgba(15,23,42,0.05)]">
          <h3 className="text-lg font-semibold">Ưu tiên khuyến nghị</h3>
          <ul className="mt-4 space-y-2 text-sm text-slate-600">
            <li>Ưu tiên đơn chờ nếu chuyển đổi giảm.</li>
            <li>Điều tra webhook lỗi nếu fulfillment chậm.</li>
            <li>Kiểm tra tồn kho license trước khi chạy marketing lớn.</li>
          </ul>
        </article>
      </div>
    </section>
  );
}
