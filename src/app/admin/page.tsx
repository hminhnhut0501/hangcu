import Link from "next/link";
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

export default async function AdminHomePage() {
  const [summary, analytics] = await Promise.all([getDashboardSummary(), getAnalyticsSummary()]);

  const cards = [
    { label: "Revenue today", value: currencyFormat.format(analytics.todayRevenueMinor / 100) },
    { label: "Revenue month", value: currencyFormat.format(analytics.monthRevenueMinor / 100) },
    { label: "Paid orders", value: String(summary.paidOrdersCount) },
    { label: "Pending orders", value: String(summary.pendingOrdersCount) },
    { label: "Conversion", value: formatPercent(analytics.conversionRate) },
    { label: "Webhook errors", value: String(analytics.webhookErrorsCount) }
  ];

  const orderTrend = renderMiniBars(analytics.dailyOrderCount.slice(-7).map(([day, value]) => [day.slice(5), value] as [string, number]), "bg-slate-900");
  const revenueTrend = renderMiniBars(analytics.dailyRevenue.slice(-7).map(([day, value]) => [day.slice(5), Math.round(value / 100)] as [string, number]), "bg-blue-500");

  return (
    <section className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.3em] text-blue-600">Dashboard</p>
          <h2 className="mt-3 text-4xl font-semibold tracking-tight">Admin overview</h2>
          <p className="mt-2 max-w-3xl text-sm text-slate-600">
            A compact operating view for revenue, conversion, fulfillment, and license lifecycle health.
          </p>
        </div>
        <Link
          href="/admin/analytics"
          className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
        >
          Open analytics
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <article key={card.label} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">{card.label}</p>
            <p className="mt-3 text-3xl font-semibold tracking-tight">{card.value}</p>
          </article>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-semibold">Revenue and order trends</h3>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Last 7 days</p>
          </div>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div>
              <p className="text-sm text-slate-500">Revenue trend</p>
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
              <p className="text-sm text-slate-500">Order trend</p>
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

        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold">Health signals</h3>
          <ul className="mt-4 space-y-3 text-sm text-slate-600">
            <li>Conversion rate: {formatPercent(analytics.conversionRate)}</li>
            <li>Fulfillment rate: {formatPercent(analytics.fulfillmentRate)}</li>
            <li>AOV: {currencyFormat.format(analytics.averageOrderValueMinor / 100)}</li>
            <li>Refunded orders: {analytics.refundedOrdersCount}</li>
            <li>Failed orders: {analytics.failedOrdersCount}</li>
            <li>Pending fulfillment: {analytics.fulfillmentPendingCount}</li>
          </ul>
        </article>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold">What to do next</h3>
          <ul className="mt-4 space-y-2 text-sm text-slate-600">
            <li>Watch weekly revenue and order trend before pushing new campaigns.</li>
            <li>Review pending orders and webhook failures together when support tickets spike.</li>
            <li>Use the compliance page before payment-provider submissions or major policy changes.</li>
          </ul>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold">Hardening status</h3>
          <ul className="mt-4 space-y-2 text-sm text-slate-600">
            <li>Server-side guards in place for admin surfaces.</li>
            <li>Audit logging available for mutations.</li>
            <li>Webhook monitoring and retry surface are ready.</li>
          </ul>
        </article>
      </div>
    </section>
  );
}
