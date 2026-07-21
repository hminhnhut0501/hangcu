import Link from "next/link";
import { listWebhookSummaries } from "@/modules/webhooks/service";

const statusStyles: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  processed: "bg-emerald-100 text-emerald-800",
  failed: "bg-rose-100 text-rose-800"
};

export default async function AdminPaymentsPage({
  searchParams
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = (await searchParams) ?? {};
  const events = await listWebhookSummaries();
  const q = typeof params.q === "string" ? params.q.trim().toLowerCase() : "";
  const provider = typeof params.provider === "string" ? params.provider : "";
  const status = typeof params.status === "string" ? params.status : "";

  const filtered = events.filter((event) => {
    const matchesQuery =
      !q ||
      event.provider.toLowerCase().includes(q) ||
      event.eventId.toLowerCase().includes(q) ||
      event.eventType.toLowerCase().includes(q);
    const matchesProvider = !provider || event.provider === provider;
    const matchesStatus = !status || event.processingStatus === status;
    return matchesQuery && matchesProvider && matchesStatus;
  });

  const failedCount = filtered.filter((event) => event.processingStatus === "failed").length;

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.3em] text-blue-600">Commerce</p>
          <h2 className="mt-3 text-4xl font-semibold tracking-tight">Payments</h2>
          <p className="mt-2 max-w-3xl text-sm text-slate-600">
            Review payment events, diagnose failures, and retry provider-linked operations from one place.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <article className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Events</p>
            <p className="mt-2 text-2xl font-semibold">{filtered.length}</p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Failed</p>
            <p className="mt-2 text-2xl font-semibold">{failedCount}</p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Providers</p>
            <p className="mt-2 text-2xl font-semibold">{new Set(filtered.map((event) => event.provider)).size}</p>
          </article>
        </div>
      </div>

      <form className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:grid-cols-3">
        <input
          name="q"
          defaultValue={typeof params.q === "string" ? params.q : ""}
          placeholder="Search provider, event ID, or event type"
          className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
        />
        <input
          name="provider"
          defaultValue={provider}
          placeholder="Provider"
          className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
        />
        <input
          name="status"
          defaultValue={status}
          placeholder="Processing status"
          className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
        />
      </form>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-6 py-4 font-medium">Provider</th>
              <th className="px-6 py-4 font-medium">Event</th>
              <th className="px-6 py-4 font-medium">Order</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Signature</th>
              <th className="px-6 py-4 font-medium">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filtered.length === 0 ? (
              <tr>
                <td className="px-6 py-10 text-center text-slate-500" colSpan={6}>
                  No matching payment events yet.
                </td>
              </tr>
            ) : (
              filtered.map((event) => (
                <tr key={`${event.provider}-${event.eventId}`}>
                  <td className="px-6 py-4 font-medium">{event.provider}</td>
                  <td className="px-6 py-4">
                    <p className="font-medium">{event.eventType}</p>
                    <p className="text-xs text-slate-500">{event.eventId}</p>
                  </td>
                  <td className="px-6 py-4">
                    {event.errorMessage ?? "See detail"}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusStyles[event.processingStatus] ?? "bg-slate-100 text-slate-700"}`}>
                      {event.processingStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4">{event.signatureValid ? "valid" : "invalid"}</td>
                  <td className="px-6 py-4">
                    <Link
                      href={`/admin/payments/${event.provider}/${event.eventId}` as any}
                      className="rounded-full border border-slate-200 px-4 py-2 text-xs font-medium text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                    >
                      Open detail
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
