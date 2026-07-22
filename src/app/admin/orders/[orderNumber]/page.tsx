import { notFound } from "next/navigation";
import Link from "next/link";
import { OrderStatusForm } from "@/components/admin/order-status-form";
import { getOrderByOrderNumber } from "@/modules/orders/service";

const statusStyles: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  paid: "bg-emerald-100 text-emerald-800",
  processing: "bg-blue-100 text-blue-800",
  fulfilled: "bg-violet-100 text-violet-800",
  failed: "bg-rose-100 text-rose-800",
  cancelled: "bg-slate-100 text-slate-700",
  unpaid: "bg-amber-100 text-amber-800",
  refunded: "bg-slate-100 text-slate-700",
  partially_refunded: "bg-slate-100 text-slate-700",
  unfulfilled: "bg-amber-100 text-amber-800",
  partially_fulfilled: "bg-blue-100 text-blue-800"
};

function formatMoney(amountMinor: number, currency: string) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency
  }).format(amountMinor / 100);
}

function formatDate(value: Date | string | null | undefined) {
  if (!value) return "N/A";
  const date = value instanceof Date ? value : new Date(value);
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
}

function formatStatus(value: string) {
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${statusStyles[value] ?? "bg-slate-100 text-slate-700"}`}>
      {value}
    </span>
  );
}

export default async function AdminOrderDetailPage({
  params
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;
  const order = await getOrderByOrderNumber(orderNumber);

  if (!order) {
    notFound();
  }

  return (
    <section className="space-y-8">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-3">
          <p className="text-sm font-medium uppercase tracking-[0.3em] text-blue-600">Chi tiết đơn</p>
          <h2 className="mt-3 text-4xl font-semibold tracking-tight">{order.orderNumber}</h2>
          <p className="text-sm text-slate-600">{order.customerEmail}</p>
          <div className="flex flex-wrap gap-2">
            {formatStatus(order.status)}
            {formatStatus(order.paymentStatus)}
            {formatStatus(order.fulfillmentStatus)}
          </div>
          <p className="text-sm text-slate-500">
            Nguồn: <span className="font-medium text-slate-700">{order.source}</span>
          </p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white px-5 py-4 shadow-[0_10px_35px_rgba(15,23,42,0.05)]">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Tổng đơn</p>
          <p className="mt-2 text-2xl font-semibold">{formatMoney(order.totalMinor, order.currency)}</p>
          <p className="mt-1 text-sm text-slate-500">Số sản phẩm: {order.items.length}</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_10px_35px_rgba(15,23,42,0.05)]">
          <p className="text-sm text-slate-500">Tạo lúc</p>
          <p className="mt-2 text-lg font-semibold">{formatDate(order.metadata.createdAt as string | undefined)}</p>
        </article>
        <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_10px_35px_rgba(15,23,42,0.05)]">
          <p className="text-sm text-slate-500">Cập nhật lúc</p>
          <p className="mt-2 text-lg font-semibold">{formatDate(order.metadata.updatedAt as string | undefined)}</p>
        </article>
        <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_10px_35px_rgba(15,23,42,0.05)]">
          <p className="text-sm text-slate-500">Khách</p>
          <p className="mt-2 text-lg font-semibold">{order.customerEmail}</p>
        </article>
        <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_10px_35px_rgba(15,23,42,0.05)]">
          <p className="text-sm text-slate-500">Hành động</p>
          <div className="mt-2">
            <Link
              href="/admin/orders"
              className="inline-flex rounded-full border border-blue-200 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50"
            >
              Về danh sách
            </Link>
          </div>
        </article>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_10px_35px_rgba(15,23,42,0.05)]">
            <div className="border-b border-slate-200 px-6 py-4">
              <h3 className="text-lg font-semibold">Mục đơn hàng</h3>
            </div>
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-[#f8fbff] text-left text-slate-500">
                <tr>
                  <th className="px-6 py-4 font-medium">Sản phẩm</th>
                  <th className="px-6 py-4 font-medium">SKU</th>
                  <th className="px-6 py-4 font-medium">SL</th>
                  <th className="px-6 py-4 font-medium">Thành tiền</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {order.items.map((item) => (
                  <tr key={`${order.orderNumber}-${item.productId}`}>
                    <td className="px-6 py-4">
                      <p className="font-medium">{item.productName}</p>
                      <p className="text-xs text-slate-500">{item.productId}</p>
                    </td>
                    <td className="px-6 py-4">{item.sku}</td>
                    <td className="px-6 py-4">{item.quantity}</td>
                    <td className="px-6 py-4">{formatMoney(item.totalAmountMinor, order.currency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_10px_35px_rgba(15,23,42,0.05)]">
            <h3 className="text-lg font-semibold">Dòng thời gian đơn</h3>
            <dl className="mt-4 grid gap-4 text-sm md:grid-cols-2">
              <div>
                <dt className="text-slate-500">Order ID</dt>
                <dd className="mt-1 font-medium">{order.id}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Tạo lúc</dt>
                <dd className="mt-1 font-medium">{formatDate(order.metadata.createdAt as string | undefined)}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Cập nhật lúc</dt>
                <dd className="mt-1 font-medium">{formatDate(order.metadata.updatedAt as string | undefined)}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Ghi chú nội bộ</dt>
                <dd className="mt-1 font-medium">{order.notes ?? "Chưa có ghi chú"}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Trạng thái thanh toán</dt>
                <dd className="mt-1 font-medium">{order.paymentStatus}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Trạng thái fulfillment</dt>
                <dd className="mt-1 font-medium">{order.fulfillmentStatus}</dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="space-y-6">
          <OrderStatusForm
            orderNumber={order.orderNumber}
            currentStatus={order.status}
            currentPaymentStatus={order.paymentStatus}
            currentFulfillmentStatus={order.fulfillmentStatus}
            currentNotes={order.notes}
          />
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-600 shadow-[0_10px_35px_rgba(15,23,42,0.05)]">
            Trang này tối ưu cho hỗ trợ và fulfillment. Các phase sau có thể thêm hoàn tiền, gửi lại email, fulfillment
            thủ công và đồng bộ trạng thái từ webhook.
          </div>
        </div>
      </div>
    </section>
  );
}
