import type { Route } from "next";
import Link from "next/link";
import { AdminDrawer } from "@/components/admin/admin-drawer";
import { AdminFilterBar } from "@/components/admin/admin-filter-bar";
import { AdminPanel } from "@/components/admin/admin-shell";
import { AdminStatusBadge } from "@/components/admin/admin-status-badge";
import { CopyButton } from "@/components/admin/copy-button";
import { FilterPills } from "@/components/admin/filter-pills";
import { SummaryCard } from "@/components/admin/summary-card";
import { filterAuditLogs, normalizeAuditQuery, serializeAuditLogValue } from "@/modules/audit/query";
import { listAuditLogs } from "@/modules/audit/service";
import type { AuditLog } from "@/modules/audit/schema";

function formatDateTime(date: Date) {
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
  { label: "Tất cả", href: "/admin/audit" as Route },
  { label: "Admin", href: "/admin/audit?actorType=admin" as Route },
  { label: "Hệ thống", href: "/admin/audit?actorType=system" as Route },
  { label: "Tích hợp", href: "/admin/audit?actorType=integration" as Route },
  { label: "Đơn hàng", href: "/admin/audit?entityType=order" as Route },
  { label: "Thanh toán", href: "/admin/audit?entityType=payment" as Route },
  { label: "License keys", href: "/admin/audit?entityType=license_key" as Route }
];

const actionFilters = [
  { label: "Đã tạo", value: "created" },
  { label: "Đã cập nhật", value: "updated" },
  { label: "Đã xóa", value: "deleted" },
  { label: "Đổi trạng thái", value: "status" }
];

const actorTone: Record<string, "neutral" | "blue" | "emerald" | "amber"> = {
  admin: "blue",
  system: "neutral",
  integration: "emerald"
};

const entityTone: Record<string, "neutral" | "blue" | "emerald" | "amber" | "rose" | "violet"> = {
  order: "amber",
  payment: "emerald",
  license_key: "violet",
  site_setting: "blue",
  audit: "neutral"
};

function actionLabel(action: string) {
  const lower = action.toLowerCase();
  if (lower.includes("created") || lower.includes("issued") || lower.includes("uploaded")) return "Đã tạo";
  if (lower.includes("updated") || lower.includes("edited") || lower.includes("saved")) return "Đã cập nhật";
  if (lower.includes("deleted") || lower.includes("removed")) return "Đã xóa";
  if (lower.includes("status") || lower.includes("revoke") || lower.includes("retry")) return "Đổi trạng thái";
  return action;
}

function actionTone(action: string): "neutral" | "blue" | "emerald" | "amber" | "rose" {
  const label = actionLabel(action);
  if (label === "Đã tạo") return "emerald";
  if (label === "Đã cập nhật") return "blue";
  if (label === "Đã xóa") return "rose";
  if (label === "Đổi trạng thái") return "amber";
  return "neutral";
}

function AuditRowDrawer({ log }: { log: AuditLog }) {
  const summaryItems = [
    { label: "ID log", value: log.id },
    { label: "Tác nhân", value: log.actorType },
    { label: "Thực thể", value: `${log.entityType} · ${log.entityId}` },
    { label: "IP", value: log.ipAddress ?? "n/a" }
  ];

  return (
    <AdminDrawer
      trigger={<button type="button" className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Xem chi tiết</button>}
      title={`${actionLabel(log.action)} · ${log.entityType}`}
      description={formatDateTime(log.createdAt)}
    >
      <div className="space-y-6">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {summaryItems.map((item) => (
            <AdminPanel key={item.label} className="space-y-1 bg-slate-50">
              <p className="text-xs font-medium text-slate-400">{item.label}</p>
              <p className="break-all text-sm font-medium text-slate-900">{item.value}</p>
            </AdminPanel>
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <AdminPanel className="space-y-3">
            <h4 className="text-sm font-semibold text-slate-950">Trước khi thay đổi</h4>
            <pre className="overflow-auto rounded-2xl bg-slate-950 p-4 text-xs text-slate-100">
              {JSON.stringify(log.beforeData ?? {}, null, 2)}
            </pre>
          </AdminPanel>
          <AdminPanel className="space-y-3">
            <h4 className="text-sm font-semibold text-slate-950">Sau khi thay đổi</h4>
            <pre className="overflow-auto rounded-2xl bg-slate-950 p-4 text-xs text-slate-100">
              {JSON.stringify(log.afterData ?? {}, null, 2)}
            </pre>
          </AdminPanel>
        </div>

        <AdminPanel className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <AdminStatusBadge label={log.actorType} tone={actorTone[log.actorType] ?? "neutral"} />
            <AdminStatusBadge label={log.entityType} tone={entityTone[log.entityType] ?? "neutral"} />
            <AdminStatusBadge label={actionLabel(log.action)} tone={actionTone(log.action)} />
          </div>
          <div className="grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
            <p>Lúc tạo: {formatDateTime(log.createdAt)}</p>
            <p>Admin: {log.adminId ?? "system"}</p>
            <p>Entity ID: {log.entityId}</p>
            <p>IP: {log.ipAddress ?? "n/a"}</p>
          </div>
        </AdminPanel>
      </div>
    </AdminDrawer>
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
    { label: "Tổng log", value: String(filtered.length), tone: "default" as const },
    { label: "Admin", value: String(filtered.filter((log) => log.actorType === "admin").length), tone: "blue" as const },
    { label: "Hệ thống", value: String(filtered.filter((log) => log.actorType === "system").length), tone: "emerald" as const },
    { label: "Tích hợp", value: String(filtered.filter((log) => log.actorType === "integration").length), tone: "amber" as const }
  ];

  const actionSummary = actionFilters.map((group) => ({
    ...group,
    count: filtered.filter((log) => actionLabel(log.action).includes(group.label.replace("Đã ", ""))).length
  }));

  const activeFilters = [
    query.q ? `Tìm: ${query.q}` : null,
    query.action ? `Action: ${query.action}` : null,
    query.entityType ? `Entity: ${query.entityType}` : null,
    query.actorType ? `Actor: ${query.actorType}` : null,
    query.from ? `Từ: ${query.from}` : null,
    query.to ? `Đến: ${query.to}` : null
  ].filter(Boolean) as string[];

  return (
    <section className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium text-blue-600">Audit</p>
          <h2 className="mt-3 text-4xl font-semibold tracking-tight">Nhật ký audit</h2>
          <p className="mt-2 max-w-3xl text-sm text-slate-600">
            Dùng để tra cứu đổi giá, đổi trạng thái, lần cấp mã và các thao tác admin/system/integration. Mở từng dòng để
            xem trước/sau và copy bằng chứng khi support cần đối soát.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href={getExportHref(params) as Route}
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
        {stats.map((card) => (
          <SummaryCard key={card.label} label={card.label} value={card.value} tone={card.tone} />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <AdminPanel className="space-y-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium text-blue-600">Bộ lọc nhanh</p>
              <h3 className="mt-2 text-xl font-semibold text-slate-950">Nhảy nhanh sang nhóm log</h3>
            </div>
            <p className="text-xs text-slate-500">{filtered.length} log đang khớp</p>
          </div>
          <FilterPills
            pills={quickFilters.map((filter) => ({
              ...filter,
              active:
                filter.href === "/admin/audit"
                  ? activeFilters.length === 0
                  : Boolean(
                      (filter.href.includes("actorType=admin") && query.actorType === "admin") ||
                        (filter.href.includes("actorType=system") && query.actorType === "system") ||
                        (filter.href.includes("actorType=integration") && query.actorType === "integration") ||
                        (filter.href.includes("entityType=order") && query.entityType === "order") ||
                        (filter.href.includes("entityType=payment") && query.entityType === "payment") ||
                        (filter.href.includes("entityType=license_key") && query.entityType === "license_key")
                    )
            }))}
          />
          {activeFilters.length ? (
            <div className="flex flex-wrap gap-2">
              {activeFilters.map((filter) => (
                <span key={filter} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                  {filter}
                </span>
              ))}
            </div>
          ) : null}
          <div className="grid gap-3 sm:grid-cols-2">
            {actionSummary.map((action) => (
              <AdminPanel key={action.label} className="space-y-1 bg-slate-50 p-4">
                <p className="text-xs font-medium text-slate-400">{action.label}</p>
                <p className="text-2xl font-semibold text-slate-950">{action.count}</p>
              </AdminPanel>
            ))}
          </div>
        </AdminPanel>

        <AdminPanel className="space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium text-blue-600">Bằng chứng</p>
              <h3 className="mt-2 text-xl font-semibold text-slate-950">Gói nhanh cho support</h3>
            </div>
            <p className="text-xs text-slate-500">Copy hoặc tải CSV</p>
          </div>
          <p className="text-sm leading-7 text-slate-600">
            Dùng nội dung này khi cần gửi reviewer, trả lời dispute hoặc tổng hợp lại luồng vận hành của một thay đổi cụ thể.
          </p>
          <CopyButton
            label="Copy evidence packet"
            value={[
              "Audit log available for admin, system and integration actions.",
              "Use CSV export for disputes or internal support review.",
              "Check before/after payload when reconciling price, order or delivery changes."
            ].join("\n")}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <Link
              href={"/admin/compliance" as Route}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-white"
            >
              Mở compliance
            </Link>
            <Link
              href={"/admin/hardening" as Route}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-white"
            >
              Mở hardening
            </Link>
          </div>
        </AdminPanel>
      </div>

      <AdminFilterBar asForm className="space-y-4">
        <input
          name="q"
          defaultValue={query.q ?? ""}
          placeholder="Tìm action, entity, ID hoặc actor"
          className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
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
        <div className="flex flex-wrap gap-2">
          <button type="submit" className="rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white hover:bg-slate-800">
            Áp dụng bộ lọc
          </button>
          <Link
            href="/admin/audit"
            className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Reset
          </Link>
        </div>
      </AdminFilterBar>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_10px_35px_rgba(15,23,42,0.05)]">
        <div className="border-b border-slate-200 px-6 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-medium text-slate-400">Danh sách log</p>
              <h3 className="mt-2 text-lg font-semibold text-slate-950">Mở từng dòng để xem payload</h3>
            </div>
            <p className="text-sm text-slate-500">{filtered.length} kết quả</p>
          </div>
        </div>

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
                <tr key={log.id} className="align-top">
                  <td className="px-6 py-4 text-slate-500">{formatDateTime(log.createdAt)}</td>
                  <td className="px-6 py-4">
                    <AdminStatusBadge label={actionLabel(log.action)} tone={actionTone(log.action)} />
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-slate-900">{log.entityType}</p>
                    <p className="mt-1 text-xs text-slate-500 break-all">{log.entityId}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-2">
                      <AdminStatusBadge label={log.actorType} tone={actorTone[log.actorType] ?? "neutral"} />
                      <p className="text-xs text-slate-500 break-all">{log.adminId ?? "system"}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <AuditRowDrawer log={log} />
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500">
                    <p>ID: {log.id}</p>
                    <p>IP: {log.ipAddress ?? "n/a"}</p>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <AdminPanel className="space-y-3">
          <p className="text-xs font-medium text-slate-400">Tra soát</p>
          <h3 className="text-xl font-semibold text-slate-950">Cách đọc log nhanh</h3>
          <p className="text-sm leading-7 text-slate-600">
            Ưu tiên nhìn entityType, entityId và before/after payload để biết thay đổi nào đã làm lệch giá, trạng thái đơn hoặc
            data cấp mã.
          </p>
        </AdminPanel>
        <AdminPanel className="space-y-3">
          <p className="text-xs font-medium text-slate-400">Đối soát</p>
          <h3 className="text-xl font-semibold text-slate-950">Khi support cần bằng chứng</h3>
          <p className="text-sm leading-7 text-slate-600">
            Dùng export CSV hoặc mở drawer từng dòng để chứng minh order đã đổi gì, ai đổi và khi nào. Điều này đặc biệt hữu ích
            khi provider hỏi lại luồng xử lý.
          </p>
        </AdminPanel>
      </div>
    </section>
  );
}
