import Link from "next/link";
import { listAuditLogs } from "@/modules/audit/service";
import { filterAuditLogs, normalizeAuditQuery } from "@/modules/audit/query";
import { FilterPills } from "@/components/admin/filter-pills";
import { SummaryCard } from "@/components/admin/summary-card";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("vi-VN", {
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

const quickFilters = [
  { label: "Tất cả", href: "/admin/audit" },
  { label: "Admin", href: "/admin/audit?actorType=admin" },
  { label: "Hệ thống", href: "/admin/audit?actorType=system" },
  { label: "Tích hợp", href: "/admin/audit?actorType=integration" },
  { label: "Đơn hàng", href: "/admin/audit?entityType=order" },
  { label: "Thanh toán", href: "/admin/audit?entityType=payment" },
  { label: "License keys", href: "/admin/audit?entityType=license_key" }
];

const actionGroups = [
  { label: "Đã tạo", match: (value: string) => value.includes("created") || value.includes("issued") || value.includes("uploaded") },
  { label: "Đã cập nhật", match: (value: string) => value.includes("updated") || value.includes("edited") || value.includes("saved") },
  { label: "Đã xóa", match: (value: string) => value.includes("deleted") || value.includes("removed") },
  { label: "Đổi trạng thái", match: (value: string) => value.includes("status") || value.includes("revoke") || value.includes("retry") }
];

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
}

function formatActorType(value: string) {
  const styles: Record<string, string> = {
    admin: "bg-blue-100 text-blue-800",
    system: "bg-slate-100 text-slate-700",
    integration: "bg-emerald-100 text-emerald-800"
  };
  return <span className={`rounded-full px-3 py-1 text-xs font-medium ${styles[value] ?? "bg-slate-100 text-slate-700"}`}>{value}</span>;
}

function formatAction(value: string) {
  const styles: Record<string, string> = {
    created: "bg-emerald-100 text-emerald-800",
    updated: "bg-blue-100 text-blue-800",
    deleted: "bg-rose-100 text-rose-800"
  };
  const key = actionGroups.find((group) => group.match(value.toLowerCase()))?.label ?? value;
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-medium ${styles[key.toLowerCase()] ?? "bg-slate-100 text-slate-700"}`}>
      {key}
    </span>
  );
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
    { label: "Tổng log", value: String(filtered.length) },
    { label: "Admin", value: String(filtered.filter((log) => log.actorType === "admin").length) },
    { label: "Hệ thống", value: String(filtered.filter((log) => log.actorType === "system").length) },
    { label: "Tích hợp", value: String(filtered.filter((log) => log.actorType === "integration").length) }
  ];

  const topActions = actionGroups.map((group) => ({
    label: group.label,
    count: filtered.filter((log) => group.match(log.action.toLowerCase())).length
  }));

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.3em] text-blue-600">Audit</p>
          <h2 className="mt-3 text-4xl font-semibold tracking-tight">Nhật ký audit</h2>
          <p className="mt-2 max-w-3xl text-sm text-slate-600">
            Lọc mọi sự kiện của admin, hệ thống và tích hợp, xem payload và xuất log khi cần hỗ trợ.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href={getExportHref(params) as any}
            className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
          >
            Xuất CSV
          </Link>
          <Link
            href="/admin/audit"
            className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
          >
            Xóa bộ lọc
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((card, index) => (
          <SummaryCard
            key={card.label}
            label={card.label}
            value={card.value}
            tone={index === 1 ? "blue" : index === 2 ? "emerald" : index === 3 ? "amber" : "default"}
          />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <FilterPills
          pills={quickFilters.map((filter) => ({
            ...filter,
            active: filter.href === "/admin/audit" ? Object.keys(params).length === 0 : (params.actorType ?? params.entityType ?? "").toString() !== ""
          }))}
        />
        <div className="grid gap-2 sm:grid-cols-2">
          {topActions.map((action) => (
            <article key={action.label} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{action.label}</p>
              <p className="mt-2 text-2xl font-semibold">{action.count}</p>
            </article>
          ))}
        </div>
      </div>

      <form className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:grid-cols-6">
        <input
          name="q"
          defaultValue={query.q ?? ""}
          placeholder="Tìm action, entity, ID hoặc actor"
          className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 lg:col-span-2"
        />
        <input
          name="action"
          defaultValue={query.action ?? ""}
          placeholder="Hành động"
          className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
        />
        <input
          name="entityType"
          defaultValue={query.entityType ?? ""}
          placeholder="Loại thực thể"
          className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
        />
        <input
          name="actorType"
          defaultValue={query.actorType ?? ""}
          placeholder="Loại tác nhân"
          className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
        />
        <input
          name="from"
          defaultValue={query.from ?? ""}
          placeholder="Từ ngày ISO"
          className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
        />
        <input
          name="to"
          defaultValue={query.to ?? ""}
          placeholder="Đến ngày ISO"
          className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
        />
      </form>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-6 py-4 font-medium">Thời gian</th>
              <th className="px-6 py-4 font-medium">Hành động</th>
              <th className="px-6 py-4 font-medium">Thực thể</th>
              <th className="px-6 py-4 font-medium">Tác nhân</th>
              <th className="px-6 py-4 font-medium">Chi tiết</th>
              <th className="px-6 py-4 font-medium">Ngữ cảnh</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filtered.length === 0 ? (
              <tr>
                <td className="px-6 py-10 text-center text-slate-500" colSpan={6}>
                  Chưa có sự kiện audit phù hợp.
                </td>
              </tr>
            ) : (
              filtered.map((log) => (
                <tr key={log.id}>
                  <td className="px-6 py-4 text-slate-500">{formatDateTime(log.createdAt)}</td>
                  <td className="px-6 py-4 font-medium">{formatAction(log.action)}</td>
                  <td className="px-6 py-4">
                    <p className="font-medium">{log.entityType}</p>
                    <p className="text-xs text-slate-500">{log.entityId}</p>
                  </td>
                  <td className="px-6 py-4">{formatActorType(log.actorType)}</td>
                  <td className="px-6 py-4">
                    <details className="group">
                      <summary className="cursor-pointer text-xs font-medium text-blue-600">
                        Xem payload
                      </summary>
                      <div className="mt-3 grid gap-3 rounded-xl bg-slate-50 p-4 text-xs text-slate-700">
                        <div className="grid gap-2 sm:grid-cols-2">
                          <p>Admin: {log.adminId ?? "system"}</p>
                          <p>IP: {log.ipAddress ?? "n/a"}</p>
                        </div>
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
                  <td className="px-6 py-4 text-xs text-slate-500">
                    <p>ID: {log.id}</p>
                    <p>Lúc: {formatDateTime(log.createdAt)}</p>
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
