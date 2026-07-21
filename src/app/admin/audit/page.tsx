import Link from "next/link";
import { listAuditLogs } from "@/modules/audit/service";
import { filterAuditLogs, normalizeAuditQuery } from "@/modules/audit/query";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
}

function getExportHref(query: Record<string, string | string[] | undefined>) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (typeof value === "string" && value.trim()) {
      params.set(key, value);
    }
  }
  const search = params.toString();
  return `/api/admin/audit/export${search ? `?${search}` : ""}`;
}

export default async function AdminAuditPage({
  searchParams
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = (await searchParams) ?? {};
  const query = normalizeAuditQuery(params);
  const logs = await listAuditLogs();
  const filtered = filterAuditLogs(logs, query);

  const stats = [
    { label: "Total logs", value: String(filtered.length) },
    { label: "Admins", value: String(filtered.filter((log) => log.actorType === "admin").length) },
    { label: "Systems", value: String(filtered.filter((log) => log.actorType === "system").length) },
    { label: "Integrations", value: String(filtered.filter((log) => log.actorType === "integration").length) }
  ];

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.3em] text-blue-600">Audit</p>
          <h2 className="mt-3 text-4xl font-semibold tracking-tight">Audit log</h2>
          <p className="mt-2 max-w-3xl text-sm text-slate-600">
            Filter every admin, system, and integration event, inspect payloads, and export the
            log when support needs a copy.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={getExportHref(params) as any}
            className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
          >
            Export CSV
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((card) => (
          <article key={card.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">{card.label}</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight">{card.value}</p>
          </article>
        ))}
      </div>

      <form className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:grid-cols-6">
        <input
          name="q"
          defaultValue={query.q ?? ""}
          placeholder="Search action, entity, ID, or actor"
          className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 lg:col-span-2"
        />
        <input
          name="action"
          defaultValue={query.action ?? ""}
          placeholder="Action"
          className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
        />
        <input
          name="entityType"
          defaultValue={query.entityType ?? ""}
          placeholder="Entity type"
          className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
        />
        <input
          name="actorType"
          defaultValue={query.actorType ?? ""}
          placeholder="Actor type"
          className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
        />
        <input
          name="from"
          defaultValue={query.from ?? ""}
          placeholder="From ISO date"
          className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
        />
        <input
          name="to"
          defaultValue={query.to ?? ""}
          placeholder="To ISO date"
          className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
        />
      </form>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-6 py-4 font-medium">Time</th>
              <th className="px-6 py-4 font-medium">Action</th>
              <th className="px-6 py-4 font-medium">Entity</th>
              <th className="px-6 py-4 font-medium">Actor</th>
              <th className="px-6 py-4 font-medium">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filtered.length === 0 ? (
              <tr>
                <td className="px-6 py-10 text-center text-slate-500" colSpan={5}>
                  No matching audit events yet.
                </td>
              </tr>
            ) : (
              filtered.map((log) => (
                <tr key={log.id}>
                  <td className="px-6 py-4 text-slate-500">{formatDate(log.createdAt)}</td>
                  <td className="px-6 py-4 font-medium">{log.action}</td>
                  <td className="px-6 py-4">
                    <p className="font-medium">{log.entityType}</p>
                    <p className="text-xs text-slate-500">{log.entityId}</p>
                  </td>
                  <td className="px-6 py-4">{log.actorType}</td>
                  <td className="px-6 py-4">
                    <details className="group">
                      <summary className="cursor-pointer text-xs font-medium text-blue-600">
                        View payload
                      </summary>
                      <div className="mt-3 grid gap-3 rounded-xl bg-slate-50 p-4 text-xs text-slate-700">
                        <pre className="overflow-auto whitespace-pre-wrap">
                          {JSON.stringify(
                            {
                              adminId: log.adminId,
                              ipAddress: log.ipAddress,
                              beforeData: log.beforeData,
                              afterData: log.afterData
                            },
                            null,
                            2
                          )}
                        </pre>
                      </div>
                    </details>
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
