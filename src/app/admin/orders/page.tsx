import { OrderBulkActions } from "@/components/admin/order-bulk-actions";
import Link from "next/link";
import { listAllOrders } from "@/modules/orders/service";
import { MoneyAmount } from "@/components/money/money-amount";
import { formatCurrencyLabel } from "@/lib/money/format";

const statusStyles: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  paid: "bg-emerald-100 text-emerald-800",
  processing: "bg-blue-100 text-blue-800",
  fulfilled: "bg-violet-100 text-violet-800",
  failed: "bg-rose-100 text-rose-800",
  cancelled: "bg-slate-100 text-slate-700"
};

const quickFilters = [
  { label: "Tất cả", href: "/admin/orders" },
  { label: "Cần payment", href: "/admin/orders?paymentStatus=pending" },
  { label: "Chưa fulfillment", href: "/admin/orders?fulfillmentStatus=unfulfilled" },
  { label: "Lỗi", href: "/admin/orders?status=failed" },
  { label: "Đã trả", href: "/admin/orders?paymentStatus=paid" }
];

function renderStatusBadge(value: string) {
  return <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusStyles[value] ?? "bg-slate-100 text-slate-700"}`}>{value}</span>;
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
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium text-blue-600">Bán hàng</p>
          <h2 className="mt-3 text-4xl font-semibold tracking-tight">Đơn hàng</h2>
          <p className="mt-2 max-w-3xl text-sm text-slate-600">
            Theo dõi đơn khách, kiểm tra trạng thái fulfillment và xử lý thủ công khi cần.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-3xl border border-slate-200 bg-white px-5 py-4 shadow-[0_10px_35px_rgba(15,23,42,0.05)]">
            <p className="text-xs font-medium text-slate-400">Đơn</p>
            <p className="mt-2 text-2xl font-semibold">{filtered.length}</p>
          </article>
          <article className="rounded-3xl border border-amber-200 bg-amber-50 px-5 py-4 shadow-[0_10px_35px_rgba(15,23,42,0.05)]">
            <p className="text-xs font-medium text-amber-700">Chờ payment</p>
            <p className="mt-2 text-2xl font-semibold">{pendingCount}</p>
          </article>
          <article className="rounded-3xl border border-rose-200 bg-rose-50 px-5 py-4 shadow-[0_10px_35px_rgba(15,23,42,0.05)]">
            <p className="text-xs font-medium text-rose-700">Lỗi</p>
            <p className="mt-2 text-2xl font-semibold">{failedCount}</p>
          </article>
          <article className="rounded-3xl border border-slate-200 bg-white px-5 py-4 shadow-[0_10px_35px_rgba(15,23,42,0.05)]">
            <p className="text-xs font-medium text-slate-400">Chưa fulfillment</p>
            <p className="mt-2 text-2xl font-semibold">{unfulfilledCount}</p>
          </article>
        </div>
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

      <form className="grid gap-3 rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_10px_35px_rgba(15,23,42,0.05)] lg:grid-cols-4">
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
        <div className="flex items-center gap-2 lg:col-span-4">
          <button type="submit" className="rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white">
            Áp dụng bộ lọc
          </button>
          <Link
            href="/admin/orders"
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Xóa lọc
          </Link>
        </div>
      </form>

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
                <td className="px-6 py-10 text-center text-slate-500" colSpan={6}>
                  Chưa có đơn nào phù hợp.
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
                    <MoneyAmount amount={order.totalMinor} currency={order.currency} locale="vi" />
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
