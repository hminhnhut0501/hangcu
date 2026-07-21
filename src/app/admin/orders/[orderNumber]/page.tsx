import { notFound } from "next/navigation";
import { OrderStatusForm } from "@/components/admin/order-status-form";
import { getOrderByOrderNumber } from "@/modules/orders/service";

function formatMoney(amountMinor: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency
  }).format(amountMinor / 100);
}

function formatDate(value: Date | string | null | undefined) {
  if (!value) return "N/A";
  const date = value instanceof Date ? value : new Date(value);
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
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
    <section className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.3em] text-blue-600">Order detail</p>
          <h2 className="mt-3 text-4xl font-semibold tracking-tight">{order.orderNumber}</h2>
          <p className="mt-2 text-sm text-slate-600">{order.customerEmail}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Order total</p>
          <p className="mt-2 text-2xl font-semibold">{formatMoney(order.totalMinor, order.currency)}</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Status</p>
          <p className="mt-2 text-lg font-semibold">{order.status}</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Payment</p>
          <p className="mt-2 text-lg font-semibold">{order.paymentStatus}</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Fulfillment</p>
          <p className="mt-2 text-lg font-semibold">{order.fulfillmentStatus}</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Source</p>
          <p className="mt-2 text-lg font-semibold">{order.source}</p>
        </article>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-6 py-4">
              <h3 className="text-lg font-semibold">Items</h3>
            </div>
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-slate-500">
                <tr>
                  <th className="px-6 py-4 font-medium">Product</th>
                  <th className="px-6 py-4 font-medium">SKU</th>
                  <th className="px-6 py-4 font-medium">Qty</th>
                  <th className="px-6 py-4 font-medium">Amount</th>
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

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold">Order timeline</h3>
            <dl className="mt-4 grid gap-4 text-sm md:grid-cols-2">
              <div>
                <dt className="text-slate-500">Order ID</dt>
                <dd className="mt-1 font-medium">{order.id}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Created</dt>
                <dd className="mt-1 font-medium">{formatDate(order.metadata.createdAt as string | undefined)}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Updated</dt>
                <dd className="mt-1 font-medium">{formatDate(order.metadata.updatedAt as string | undefined)}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Internal notes</dt>
                <dd className="mt-1 font-medium">{order.notes ?? "No notes yet"}</dd>
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
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-600 shadow-sm">
            This phase keeps order operations lightweight. Next phases can add refund, resend email,
            manual fulfillment, and webhook-linked status updates.
          </div>
        </div>
      </div>
    </section>
  );
}
