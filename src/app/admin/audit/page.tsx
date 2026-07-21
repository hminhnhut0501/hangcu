import { listAuditLogs } from "@/modules/audit/service";

export default async function AdminAuditPage() {
  const logs = await listAuditLogs();

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.3em] text-blue-600">
          Audit
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight">Audit log</h2>
      </div>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-6 py-4 font-medium">Action</th>
              <th className="px-6 py-4 font-medium">Entity</th>
              <th className="px-6 py-4 font-medium">Actor</th>
              <th className="px-6 py-4 font-medium">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {logs.map((log) => (
              <tr key={log.id}>
                <td className="px-6 py-4">{log.action}</td>
                <td className="px-6 py-4">
                  {log.entityType} / {log.entityId}
                </td>
                <td className="px-6 py-4">{log.actorType}</td>
                <td className="px-6 py-4">{log.createdAt.toISOString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
