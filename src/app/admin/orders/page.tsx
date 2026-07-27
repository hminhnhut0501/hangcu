import { AdminFilterBar } from "@/components/admin/admin-filter-bar";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminStatsRow } from "@/components/admin/admin-stats-row";
import { AdminStatusBadge } from "@/components/admin/admin-status-badge";
import { AdminEmptyState } from "@/components/admin/admin-empty-state";
import { OrderBulkActions } from "@/components/admin/order-bulk-actions";
import Link from "next/link";
import { listAllOrders } from "@/modules/orders/service";
import { formatCurrencyLabel } from "@/lib/money/format";
import { AdminMoneyDisplay } from "@/components/admin/admin-money-display";

const quickFilters = [
  { label: "Tất cả", href: "/admin/orders" },
  { label: "Cần payment", href: "/admin/orders?paymentStatus=pending" },
  { label: "Chưa fulfillment", href: "/admin/orders?fulfillmentStatus=unfulfilled" },
  { label: "Lỗi", href: "/admin/orders?status=failed" },
  { label: "Đã trả", href: "/admin/orders?paymentStatus=paid" }
];

function renderStatusBadge(value: string) {
  const tone =
    value === "paid" || value === "fulfilled"
      ? "emerald"
      : value === "processing"
        ? "blue"
        : value === "pending"
          ? "amber"
          : value === "failed"
            ? "rose"
            : "neutral";
  return <AdminStatusBadge tone={tone} label={value} />;
}

function formatProvider(order: { paymentProvider?: string | null; metadata?: Record<string, unknown> }) {
  return (
    order.paymentProvider ||
    String(order.metadata?.paymentProvider ?? order.metadata?.checkoutProvider ?? order.metadata?.provider ?? order.metadata?.paymentGateway ?? "n/a")
  );
}

export default async function AdminOrdersPage({
  searchParams
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = (await searchParams) ?? {};
  const orders = await listAllOrders();
  const q = typeof params.q === "string" ? params.q.trim().toLowerCase() : "";
  const status = typeof params.status === "string" ? params.status : "";
  const paymentStatus = typeof params.paymentStatus === "string" ? params.paymentStatus : "";
  const fulfillmentStatus =
    typeof params.fulfillmentStatus === "string" ? params.fulfillmentStatus : "";

  const filtered = orders
    .filter((order) => {
      const matchesQuery =
        !q ||
        order.orderNumber.toLowerCase().includes(q) ||
        order.customerEmail.toLowerCase().includes(q);
      const matchesStatus = !status || order.status === status;
      const matchesPayment = !paymentStatus || order.paymentStatus === paymentStatus;
      const matchesFulfillment = !fulfillmentStatus || order.fulfillmentStatus === fulfillmentStatus;
      return matchesQuery && matchesStatus && matchesPayment && matchesFulfillment;
    })
    .reverse();

  const totalMinor = filtered.reduce((sum, order) => sum + order.totalMinor, 0);
  const pendingCount = orders.filter((order) => order.paymentStatus === "pending" || order.paymentStatus === "unpaid").length;
  const failedCount = orders.filter((order) => order.status === "failed" || order.paymentStatus === "failed").length;
  const unfulfilledCount = orders.filter((order) => order.fulfillmentStatus !== "fulfilled").length;

  return (
    <section className="space-y-8">
      <AdminPageHeader
        eyebrow="Bán hàng"
        title="Đơn hàng"
        description="Theo dõi đơn khách, kiểm tra trạng thái fulfillment và xử lý thủ công khi cần."
      />

      <AdminStatsRow
        stats={[
          { label: "Đơn", value: filtered.length },
          { label: "Chờ payment", value: pendingCount, tone: "amber" },
          { label: "Lỗi", value: failedCount, tone: "rose" },
          { label: "Chưa fulfillment", value: unfulfilledCount }
        ]}
      />

      <div className="flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <span className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Phím tắt</span>
        <Link href="/admin/orders?paymentStatus=pending" className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-white">
          Chờ payment
        </Link>
        <Link href="/admin/orders?fulfillmentStatus=unfulfilled" className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-white">
          Chưa fulfillment
        </Link>
        <Link href="/admin/orders?status=failed" className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-white">
          Đơn lỗi
        </Link>
        <Link href="/admin/audit?entityType=order" className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-white">
          Mở audit
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        {quickFilters.map((filter) => {
          const active =
            filter.href === "/admin/orders"
              ? !q && !status && !paymentStatus && !fulfillmentStatus
              : filter.href.includes(`paymentStatus=${paymentStatus}`) ||
                filter.href.includes(`fulfillmentStatus=${fulfillmentStatus}`) ||
                filter.href.includes(`status=${status}`);
          return (
            <Link
              key={filter.href}
              href={filter.href as any}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                active ? "bg-slate-950 text-white" : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              {filter.label}
            </Link>
          );
        })}
      </div>

      <AdminFilterBar
        asForm
        actions={
          <>
            <button type="submit" className="rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white">
              Áp dụng bộ lọc
            </button>
            <Link
              href="/admin/orders"
              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Xóa lọc
            </Link>
          </>
        }
      >
        <input
          name="q"
          defaultValue={typeof params.q === "string" ? params.q : ""}
          placeholder="Tìm mã đơn hoặc email"
          className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
        />
        <input
          name="status"
          defaultValue={status}
          placeholder="Trạng thái"
          className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
        />
        <input
          name="paymentStatus"
          defaultValue={paymentStatus}
          placeholder="Trạng thái thanh toán"
          className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
        />
        <input
          name="fulfillmentStatus"
          defaultValue={fulfillmentStatus}
          placeholder="Trạng thái fulfillment"
          className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
        />
      </AdminFilterBar>

      <OrderBulkActions
        orders={filtered.map((order) => ({
          orderNumber: order.orderNumber,
          customerEmail: order.customerEmail,
          status: order.status,
          paymentStatus: order.paymentStatus,
          fulfillmentStatus: order.fulfillmentStatus,
          href: `/admin/orders/${order.orderNumber}`
        }))}
      />

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_10px_35px_rgba(15,23,42,0.05)]">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-[#f8fbff] text-left text-slate-500">
            <tr>
              <th className="px-6 py-4 font-medium">Đơn</th>
              <th className="px-6 py-4 font-medium">Khách</th>
              <th className="px-6 py-4 font-medium">Trạng thái</th>
              <th className="px-6 py-4 font-medium">Payment</th>
              <th className="px-6 py-4 font-medium">Fulfillment</th>
              <th className="px-6 py-4 font-medium">Gateway</th>
              <th className="px-6 py-4 font-medium">Tổng</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filtered.length === 0 ? (
              <tr>
                <td className="px-6 py-10" colSpan={7}>
                  <AdminEmptyState
                    title="Không có đơn phù hợp"
                    description="Thử bỏ bớt bộ lọc hoặc kiểm tra lại trạng thái payment / fulfillment."
                  />
                </td>
              </tr>
            ) : (
              filtered.map((order) => (
                <tr key={order.orderNumber}>
                  <td className="px-6 py-4">
                    <Link href={`/admin/orders/${order.orderNumber}`} className="font-medium text-blue-700 hover:underline">
                      {order.orderNumber}
                    </Link>
                    <p className="text-xs text-slate-500">Nguồn: {order.source}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium">{order.customerEmail}</p>
                    <p className="text-xs text-slate-500">{formatCurrencyLabel(order.currency, "vi") ?? order.currency}</p>
                  </td>
                  <td className="px-6 py-4">{renderStatusBadge(order.status)}</td>
                  <td className="px-6 py-4">{renderStatusBadge(order.paymentStatus)}</td>
                  <td className="px-6 py-4">{renderStatusBadge(order.fulfillmentStatus)}</td>
                  <td className="px-6 py-4">
                    <p className="font-medium">{formatProvider(order)}</p>
                    <p className="text-xs text-slate-500">
                      {order.providerOrderId || order.providerCheckoutId || order.providerPaymentId || "Chưa có mã"}
                    </p>
                  </td>
                  <td className="px-6 py-4 font-medium">
                    <AdminMoneyDisplay amount={order.totalMinor} currency={order.currency} locale="vi" />
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
