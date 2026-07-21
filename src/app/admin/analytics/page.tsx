import { getAnalyticsSummary } from "@/modules/analytics/service";

const currencyFormat = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD"
});

function formatPercent(value: number) {
  return `${(value * 100).toFixed(1)}%`;
}

export default async function AdminAnalyticsPage() {
  const analytics = await getAnalyticsSummary();

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.3em] text-blue-600">Overview</p>
        <h2 className="mt-3 text-4xl font-semibold tracking-tight">Analytics</h2>
        <p className="mt-2 max-w-3xl text-sm text-slate-600">
          Revenue, conversion, fulfillment, and operational health across the storefront and license lifecycle.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Revenue month</p>
          <p className="mt-3 text-3xl font-semibold">{currencyFormat.format(analytics.monthRevenueMinor / 100)}</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Revenue week</p>
          <p className="mt-3 text-3xl font-semibold">{currencyFormat.format(analytics.weekRevenueMinor / 100)}</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Conversion</p>
          <p className="mt-3 text-3xl font-semibold">{formatPercent(analytics.conversionRate)}</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Fulfillment</p>
          <p className="mt-3 text-3xl font-semibold">{formatPercent(analytics.fulfillmentRate)}</p>
        </article>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold">Daily revenue</h3>
          <div className="mt-4 space-y-3">
            {analytics.dailyRevenue.length === 0 ? (
              <p className="text-sm text-slate-500">No revenue data with timestamps yet.</p>
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

        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold">Operational signals</h3>
          <ul className="mt-4 space-y-3 text-sm text-slate-600">
            <li>Today orders: {analytics.todayOrderCount}</li>
            <li>Week orders: {analytics.weekOrderCount}</li>
            <li>Month orders: {analytics.monthOrderCount}</li>
            <li>Average order value: {currencyFormat.format(analytics.averageOrderValueMinor / 100)}</li>
            <li>Pending orders: {analytics.pendingOrdersCount}</li>
            <li>Refunded orders: {analytics.refundedOrdersCount}</li>
            <li>Webhook errors: {analytics.webhookErrorsCount}</li>
            <li>Audit events: {analytics.auditEventsCount}</li>
          </ul>
        </article>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold">License inventory</h3>
          <ul className="mt-4 space-y-2 text-sm text-slate-600">
            <li>Available: {analytics.licenseKeyAvailableCount}</li>
            <li>Issued: {analytics.licenseKeyIssuedCount}</li>
            <li>Redeemed: {analytics.licenseKeyRedeemedCount}</li>
          </ul>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold">Recent audit actions</h3>
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
        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold">Recommended focus</h3>
          <ul className="mt-4 space-y-2 text-sm text-slate-600">
            <li>Prioritize pending orders if conversion dips.</li>
            <li>Investigate webhook failures if fulfillment stalls.</li>
            <li>Check license inventory before running marketing pushes.</li>
          </ul>
        </article>
      </div>
    </section>
  );
}
