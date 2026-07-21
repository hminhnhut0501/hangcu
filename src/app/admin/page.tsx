import Link from "next/link";
import { getDashboardSummary } from "@/modules/dashboard/service";

const currencyFormat = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD"
});

export default async function AdminHomePage() {
  const summary = await getDashboardSummary();

  const cards = [
    { label: "Revenue today", value: currencyFormat.format(summary.todayRevenueMinor / 100) },
    { label: "Revenue month", value: currencyFormat.format(summary.monthRevenueMinor / 100) },
    { label: "Paid orders", value: String(summary.paidOrdersCount) },
    { label: "Pending orders", value: String(summary.pendingOrdersCount) },
    { label: "License keys issued", value: String(summary.licenseKeyIssued) },
    { label: "Webhook errors", value: String(summary.webhookErrorsCount) }
  ];

  return (
    <section className="space-y-8">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.3em] text-blue-600">
          Dashboard
        </p>
        <h2 className="mt-3 text-4xl font-semibold tracking-tight">Admin overview</h2>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <article
            key={card.label}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <p className="text-sm text-slate-500">{card.label}</p>
            <p className="mt-3 text-3xl font-semibold tracking-tight">{card.value}</p>
          </article>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold">Operational shortcuts</h3>
          <div className="mt-4 flex flex-wrap gap-3 text-sm">
            <Link href="/admin/coupons" className="rounded-full bg-slate-950 px-4 py-2 text-white">
              Coupons
            </Link>
            <Link href={"/admin/license-plans" as any} className="rounded-full border border-slate-200 px-4 py-2">
              License plans
            </Link>
            <Link href={"/admin/donate-packages" as any} className="rounded-full border border-slate-200 px-4 py-2">
              Donate packages
            </Link>
            <Link href={"/admin/license-keys" as any} className="rounded-full border border-slate-200 px-4 py-2">
              License keys
            </Link>
            <Link href="/admin/webhooks" className="rounded-full border border-slate-200 px-4 py-2">
              Webhooks
            </Link>
            <Link href="/admin/audit" className="rounded-full border border-slate-200 px-4 py-2">
              Audit log
            </Link>
          </div>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold">Hardening status</h3>
          <ul className="mt-4 space-y-2 text-sm text-slate-600">
            <li>Server-side guards in place for admin surfaces.</li>
            <li>Audit logging available for mutations.</li>
            <li>Webhook monitoring view ready for retries.</li>
          </ul>
        </article>
      </div>
    </section>
  );
}
