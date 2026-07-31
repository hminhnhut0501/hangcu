import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminStatsRow } from "@/components/admin/admin-stats-row";
import { AdminStatusBadge } from "@/components/admin/admin-status-badge";
import { OrderStatusForm } from "@/components/admin/order-status-form";
import { getOrderByOrderNumber } from "@/modules/orders/service";
import { MoneyAmount } from "@/components/money/money-amount";
import { formatCurrencyLabel } from "@/lib/money/format";

function formatDate(value: Date | string | null | undefined) {
  if (!value) return "N/A";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";
  return new Intl.DateTimeFormat("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).format(date);
}

function displaySource(value: string) {
  const source = value.toLowerCase();
  if (source === "bot_support_reconciliation" || source === "telegram_checkout") return "Đơn hỗ trợ";
  if (source === "bot_checkout" || source === "prive_bot") return "Đơn hỗ trợ";
  return value;
}

function displayFulfillment(value: string | null | undefined) {
  if (!value || value === "telegram_delivery") return "Digital delivery";
  if (value === "auto_email") return "Email delivery";
  return value;
}

function displaySku(value: string) {
  return value === "SUPPORT_TELEGRAM" ? "SUPPORT" : value;
}

function formatStatus(value: string) {
  const tone =
    value === "paid" || value === "fulfilled"
      ? "emerald"
      : value === "processing" || value === "partially_fulfilled"
        ? "blue"
        : value === "pending" || value === "unpaid" || value === "unfulfilled"
          ? "amber"
          : value === "failed"
            ? "rose"
            : "neutral";
  return <AdminStatusBadge tone={tone} label={value} />;
}

function formatValue(value: unknown) {
  if (value == null || value === "") return "N/A";
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}T/.test(value)) return formatDate(value);
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function EvidenceRow({ label, value }: { label: string; value: unknown }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_10px_35px_rgba(15,23,42,0.04)]">
      <p className="text-xs font-medium text-slate-400">{label}</p>
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
    { label: "Fulfillment method", value: displayFulfillment(order.fulfillmentMethod) },
    { label: "Delivered at", value: order.deliveredAt },
    { label: "License key IDs", value: order.deliveryLicenseKeyIds.length > 0 ? order.deliveryLicenseKeyIds.join(", ") : "N/A" },
    { label: "Proof", value: order.deliveryProof },
    { label: "Payment recorded at", value: order.paymentRecordedAt },
    { label: "First paid at", value: order.firstPaidAt },
    { label: "Last payment event", value: order.lastPaymentEventAt }
  ];

  return (
    <section className="space-y-8">
      <AdminPageHeader
        eyebrow="Chi tiết đơn"
        title={order.orderNumber}
        description={order.customerEmail}
        actions={
          <Link
            href="/admin/orders"
            className="inline-flex rounded-full border border-blue-200 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50"
          >
            Về danh sách
          </Link>
        }
      />

      <AdminStatsRow
        stats={[
          { label: "Tổng đơn", value: new Intl.NumberFormat("vi-VN", { style: "currency", currency: order.currency }).format(order.totalMinor / 100) },
          { label: "Items", value: order.items.length },
          { label: "Payment", value: order.paymentStatus, tone: "amber" },
          { label: "Fulfillment", value: order.fulfillmentStatus, tone: "blue" }
        ]}
      />

      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_10px_35px_rgba(15,23,42,0.05)]">
        <div className="flex flex-wrap gap-2">
          {formatStatus(order.status)}
          {formatStatus(order.paymentStatus)}
          {formatStatus(order.fulfillmentStatus)}
        </div>
        <div className="mt-4 flex flex-wrap gap-2 text-sm text-slate-500">
          <span className="rounded-full bg-slate-100 px-3 py-1">Loại đơn: {displaySource(order.source)}</span>
          <span className="rounded-full bg-slate-100 px-3 py-1">Currency: {formatCurrencyLabel(order.currency, "vi") ?? order.currency}</span>
          <span className="rounded-full bg-slate-100 px-3 py-1">Items: {order.items.length}</span>
          <span className="rounded-full bg-slate-100 px-3 py-1">Order ID: {order.id}</span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <EvidenceRow label="Tạo lúc" value={order.metadata.createdAt as string | undefined} />
        <EvidenceRow label="Cập nhật lúc" value={order.metadata.updatedAt as string | undefined} />
        <EvidenceRow label="Payment provider" value={order.paymentProvider ?? order.metadata.paymentProvider ?? "N/A"} />
        <EvidenceRow label="Fulfillment" value={displayFulfillment(order.fulfillmentMethod)} />
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
                      <p className="text-xs text-slate-500">{displaySku(item.productId)}</p>
                    </td>
                    <td className="px-6 py-4">{displaySku(item.sku)}</td>
                    <td className="px-6 py-4">{item.quantity}</td>
                    <td className="px-6 py-4">
                      <MoneyAmount amount={item.totalAmountMinor} currency={order.currency} locale="vi" />
                    </td>
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
