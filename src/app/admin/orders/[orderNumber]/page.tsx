import Link from "next/link";
import { notFound } from "next/navigation";
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
  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${statusStyles[value] ?? "bg-slate-100 text-slate-700"}`}>{value}</span>;
}

function formatValue(value: unknown) {
  if (value == null || value === "") return "N/A";
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function EvidenceRow({ label, value }: { label: string; value: unknown }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_10px_35px_rgba(15,23,42,0.04)]">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">{label}</p>
      <p className="mt-2 text-sm font-semibold text-slate-950">{formatValue(value)}</p>
    </div>
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

  const paymentRefs = [
    { label: "Gateway", value: order.paymentProvider ?? order.metadata.paymentProvider ?? order.metadata.checkoutProvider ?? order.metadata.provider ?? order.source },
    { label: "Checkout ID", value: order.providerCheckoutId ?? order.metadata.providerCheckoutId ?? order.metadata.paymentSessionId ?? order.metadata.checkoutId },
    { label: "Order/Transaction ID", value: order.providerOrderId ?? order.metadata.providerOrderId ?? order.metadata.payosOrderCode ?? order.metadata.orderId },
    { label: "Payment ID", value: order.providerPaymentId ?? order.metadata.providerPaymentId },
    { label: "Webhook event", value: order.providerEventId ?? order.metadata.providerEventId }
  ];

  const deliveryRefs = [
    { label: "Fulfillment method", value: order.fulfillmentMethod ?? "auto_email" },
    { label: "Delivered at", value: order.deliveredAt },
    { label: "License key IDs", value: order.deliveryLicenseKeyIds.length > 0 ? order.deliveryLicenseKeyIds.join(", ") : "N/A" },
    { label: "Proof", value: order.deliveryProof },
    { label: "Payment recorded at", value: order.paymentRecordedAt },
    { label: "First paid at", value: order.firstPaidAt },
    { label: "Last payment event", value: order.lastPaymentEventAt }
  ];

  return (
    <section className="space-y-8">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_10px_35px_rgba(15,23,42,0.05)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <p className="text-sm font-medium text-blue-600">Chi tiết đơn</p>
            <h2 className="text-4xl font-semibold tracking-tight">{order.orderNumber}</h2>
            <p className="text-sm text-slate-600">{order.customerEmail}</p>
            <div className="flex flex-wrap gap-2">
              {formatStatus(order.status)}
              {formatStatus(order.paymentStatus)}
              {formatStatus(order.fulfillmentStatus)}
            </div>
            <div className="flex flex-wrap gap-2 text-sm text-slate-500">
              <span className="rounded-full bg-slate-100 px-3 py-1">Nguồn: {order.source}</span>
              <span className="rounded-full bg-slate-100 px-3 py-1">Currency: {order.currency}</span>
              <span className="rounded-full bg-slate-100 px-3 py-1">Items: {order.items.length}</span>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">Tổng đơn</p>
              <p className="mt-2 text-2xl font-semibold">{formatMoney(order.totalMinor, order.currency)}</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">Mã đơn</p>
              <p className="mt-2 text-base font-semibold">{order.id}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <EvidenceRow label="Tạo lúc" value={order.metadata.createdAt as string | undefined} />
        <EvidenceRow label="Cập nhật lúc" value={order.metadata.updatedAt as string | undefined} />
        <EvidenceRow label="Payment provider" value={order.paymentProvider ?? order.metadata.paymentProvider ?? "N/A"} />
        <EvidenceRow label="Fulfillment" value={order.fulfillmentMethod ?? "auto_email"} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_10px_35px_rgba(15,23,42,0.05)]">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <h3 className="text-lg font-semibold">Mục đơn hàng</h3>
              <span className="text-xs font-medium text-slate-500">Line items</span>
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

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_10px_35px_rgba(15,23,42,0.05)]">
              <h3 className="text-lg font-semibold">Payment evidence</h3>
              <div className="mt-4 grid gap-3">
                {paymentRefs.map((item) => (
                  <EvidenceRow key={item.label} label={item.label} value={item.value} />
                ))}
              </div>
            </div>
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_10px_35px_rgba(15,23,42,0.05)]">
              <h3 className="text-lg font-semibold">Fulfillment evidence</h3>
              <div className="mt-4 grid gap-3">
                {deliveryRefs.map((item) => (
                  <EvidenceRow key={item.label} label={item.label} value={item.value} />
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_10px_35px_rgba(15,23,42,0.05)]">
            <h3 className="text-lg font-semibold">Dòng thời gian đơn</h3>
            <div className="mt-4 grid gap-4 text-sm md:grid-cols-2">
              <EvidenceRow label="Order ID" value={order.id} />
              <EvidenceRow label="Ghi chú nội bộ" value={order.notes ?? "Chưa có ghi chú"} />
              <EvidenceRow label="Trạng thái thanh toán" value={order.paymentStatus} />
              <EvidenceRow label="Trạng thái fulfillment" value={order.fulfillmentStatus} />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <OrderStatusForm
            orderNumber={order.orderNumber}
            currentStatus={order.status}
            currentPaymentStatus={order.paymentStatus}
            currentFulfillmentStatus={order.fulfillmentStatus}
            currentNotes={order.notes}
            triggerLabel="Chỉnh trạng thái"
            drawerTitle="Chỉnh trạng thái đơn"
            drawerDescription="Mở drawer để cập nhật trạng thái đơn hàng và ghi chú nội bộ."
          />

          <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white p-6 shadow-[0_10px_35px_rgba(15,23,42,0.05)]">
            <h3 className="text-lg font-semibold">Checklist đối soát</h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              <li>• Đã lưu transaction / checkout ID của cổng thanh toán</li>
              <li>• Đã gắn license key IDs vào đơn</li>
              <li>• Có thời điểm payment recorded và delivered</li>
              <li>• Có proof JSON để export khi PayPal yêu cầu</li>
            </ul>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-6 text-sm text-slate-600 shadow-[0_10px_35px_rgba(15,23,42,0.05)]">
            Trang này là nguồn đối soát chính. Khi cần gửi bằng chứng giao hàng, dùng các trường payment evidence, license key IDs và fulfillment proof ở trên.
            <div className="mt-4">
              <Link href="/admin/orders" className="inline-flex rounded-full border border-slate-200 bg-white px-4 py-2 font-medium text-slate-700 hover:bg-slate-50">
                Về danh sách
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
