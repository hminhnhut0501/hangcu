import { AdminFilterBar } from "@/components/admin/admin-filter-bar";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminStatsRow } from "@/components/admin/admin-stats-row";
import { OrderBulkActions } from "@/components/admin/order-bulk-actions";
import Link from "next/link";
import { listAllOrders } from "@/modules/orders/service";

const quickFilters = [
  { label: "Tất cả", href: "/admin/orders" },
  { label: "Cần payment", href: "/admin/orders?paymentStatus=pending" },
  { label: "Chưa fulfillment", href: "/admin/orders?fulfillmentStatus=unfulfilled" },
  { label: "Lỗi", href: "/admin/orders?status=failed" },
  { label: "Đã trả", href: "/admin/orders?paymentStatus=paid" }
];

function formatProvider(order: { paymentProvider?: string | null; metadata?: Record<string, unknown> }) {
  return (
    order.paymentProvider ||
    String(order.metadata?.paymentProvider ?? order.metadata?.checkoutProvider ?? order.metadata?.provider ?? order.metadata?.paymentGateway ?? "n/a")
  );
}

function displaySource(value: string) {
  const source = value.toLowerCase();
  if (source === "bot_support_reconciliation" || source === "telegram_checkout" || source === "bot_checkout" || source === "prive_bot") {
    return "Đơn hỗ trợ";
  }
  return value;
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
    .sort((a, b) => {
      const aCreated = String(a.metadata?.createdAt ?? "");
      const bCreated = String(b.metadata?.createdAt ?? "");
      return bCreated.localeCompare(aCreated) || b.orderNumber.localeCompare(a.orderNumber);
    });

  const requestedPage = Number.parseInt(typeof params.page === "string" ? params.page : "1", 10);
  const requestedPageSize = Number.parseInt(typeof params.pageSize === "string" ? params.pageSize : "25", 10);
  const pageSize = requestedPageSize === 50 ? 50 : 25;
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const page = Math.min(Math.max(Number.isFinite(requestedPage) ? requestedPage : 1, 1), totalPages);
  const pageOrders = filtered.slice((page - 1) * pageSize, page * pageSize);

  function pageHref(nextPage: number) {
    const query = new URLSearchParams();
    if (q) query.set("q", q);
    if (status) query.set("status", status);
    if (paymentStatus) query.set("paymentStatus", paymentStatus);
    if (fulfillmentStatus) query.set("fulfillmentStatus", fulfillmentStatus);
    query.set("page", String(nextPage));
    query.set("pageSize", String(pageSize));
    return `/admin/orders?${query.toString()}`;
  }

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
        <span className="text-xs font-medium text-slate-400">Phím tắt</span>
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
        orders={pageOrders.map((order) => ({
          orderNumber: order.orderNumber,
          customerEmail: order.customerEmail,
          source: displaySource(order.source),
          status: order.status,
          paymentStatus: order.paymentStatus,
          fulfillmentStatus: order.fulfillmentStatus,
          paymentProvider: formatProvider(order),
          providerReference: order.providerOrderId || order.providerCheckoutId || order.providerPaymentId || "Chưa có mã",
          totalMinor: order.totalMinor,
          currency: order.currency,
          createdAt: String(order.metadata?.createdAt ?? ""),
          href: `/admin/orders/${order.orderNumber}`
        }))}
      />

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm">
        <span className="text-slate-500">
          Hiển thị {filtered.length === 0 ? 0 : (page - 1) * pageSize + 1}-{Math.min(page * pageSize, filtered.length)} / {filtered.length} đơn
        </span>
        <div className="flex items-center gap-2">
          <Link href={(page > 1 ? pageHref(page - 1) : "#") as any} aria-disabled={page <= 1} className={`rounded-full border px-3 py-2 ${page <= 1 ? "pointer-events-none opacity-40" : "border-slate-200 text-slate-700"}`}>
            Trước
          </Link>
          <span className="rounded-full bg-slate-950 px-3 py-2 text-white">{page} / {totalPages}</span>
          <Link href={(page < totalPages ? pageHref(page + 1) : "#") as any} aria-disabled={page >= totalPages} className={`rounded-full border px-3 py-2 ${page >= totalPages ? "pointer-events-none opacity-40" : "border-slate-200 text-slate-700"}`}>
            Sau
          </Link>
          <Link href={pageHref(1).replace(`pageSize=${pageSize}`, `pageSize=${pageSize === 25 ? 50 : 25}`) as any} className="rounded-full border border-slate-200 px-3 py-2 text-slate-700">
            {pageSize === 25 ? "50/trang" : "25/trang"}
          </Link>
        </div>
      </div>
    </section>
  );
}
