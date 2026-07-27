import Link from "next/link";
import { listWebhookSummaries } from "@/modules/webhooks/service";
import { FilterPills } from "@/components/admin/filter-pills";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminStatsRow } from "@/components/admin/admin-stats-row";
import { AdminFilterBar } from "@/components/admin/admin-filter-bar";
import { AdminStatusBadge } from "@/components/admin/admin-status-badge";
import { AdminEmptyState } from "@/components/admin/admin-empty-state";

const quickFilters = [
  { label: "Tất cả", href: "/admin/payments" },
  { label: "Lỗi", href: "/admin/payments?status=failed" },
  { label: "Chờ", href: "/admin/payments?status=pending" },
  { label: "Đã xử lý", href: "/admin/payments?status=processed" }
];

function renderStatusBadge(value: string) {
  const labelMap: Record<string, string> = {
    pending: "Chờ",
    processed: "Đã xử lý",
    failed: "Lỗi"
  };
  const tone = value === "processed" ? "emerald" : value === "pending" ? "amber" : value === "failed" ? "rose" : "neutral";
  return <AdminStatusBadge tone={tone} label={labelMap[value] ?? value} />;
}

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
  const pendingCount = filtered.filter((event) => event.processingStatus === "pending").length;
  const processedCount = filtered.filter((event) => event.processingStatus === "processed").length;
  const providerCount = new Set(filtered.map((event) => event.provider)).size;

  return (
    <section className="space-y-8">
      <AdminPageHeader
        eyebrow="Bán hàng"
        title="Thanh toán"
        description="Xem event payment, chẩn đoán lỗi và retry thao tác liên quan cổng thanh toán ở một nơi."
      />

      <AdminStatsRow
        stats={[
          { label: "Event", value: filtered.length },
          { label: "Chờ", value: pendingCount, tone: "amber" },
          { label: "Lỗi", value: failedCount, tone: "rose" },
          { label: "Đã xử lý", value: processedCount, tone: "emerald" }
        ]}
      />

      <FilterPills
        pills={quickFilters.map((filter) => ({
          ...filter,
          active: filter.href === "/admin/payments" ? !status : filter.href.includes(`status=${status}`)
        }))}
      />

      <AdminFilterBar
        asForm
        actions={
          <>
            <button type="submit" className="rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white">
              Áp dụng bộ lọc
            </button>
            <Link
              href="/admin/payments"
              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Xóa lọc
            </Link>
            <span className="text-sm text-slate-500">Providers: {providerCount}</span>
          </>
        }
      >
        <input
          name="q"
          defaultValue={typeof params.q === "string" ? params.q : ""}
          placeholder="Tìm provider, event ID hoặc event type"
          className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 lg:col-span-2"
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
          placeholder="Trạng thái xử lý"
          className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
        />
      </AdminFilterBar>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_10px_35px_rgba(15,23,42,0.05)]">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-[#f8fbff] text-left text-slate-500">
            <tr>
              <th className="px-6 py-4 font-medium">Provider</th>
              <th className="px-6 py-4 font-medium">Event</th>
              <th className="px-6 py-4 font-medium">Đơn</th>
              <th className="px-6 py-4 font-medium">Trạng thái</th>
              <th className="px-6 py-4 font-medium">Signature</th>
              <th className="px-6 py-4 font-medium">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filtered.length === 0 ? (
              <tr>
                <td className="px-6 py-10" colSpan={6}>
                  <AdminEmptyState
                    title="Không có event payment phù hợp"
                    description="Hãy xóa bớt bộ lọc hoặc đổi provider / trạng thái xử lý."
                  />
                </td>
              </tr>
            ) : (
              filtered.map((event) => (
                <tr key={`${event.provider}-${event.eventId}`}>
                  <td className="px-6 py-4 font-medium">
                    <p>{event.provider}</p>
                    <p className="text-xs text-slate-500">{event.signatureValid ? "signature hợp lệ" : "signature lỗi"}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium">{event.eventType}</p>
                    <p className="text-xs text-slate-500">{event.eventId}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium">{event.errorMessage ?? "Xem chi tiết"}</p>
                    <p className="text-xs text-slate-500">Nhận lúc: {event.receivedAt}</p>
                  </td>
                  <td className="px-6 py-4">{renderStatusBadge(event.processingStatus)}</td>
                  <td className="px-6 py-4">{event.signatureValid ? "Hợp lệ" : "Không hợp lệ"}</td>
                  <td className="px-6 py-4">
                    <Link
                      href={`/admin/payments/${event.provider}/${event.eventId}` as any}
                      className="rounded-full border border-slate-200 px-4 py-2 text-xs font-medium text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                    >
                      Mở chi tiết
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
