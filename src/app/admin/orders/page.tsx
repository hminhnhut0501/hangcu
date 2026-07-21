import { OrderBulkActions } from "@/components/admin/order-bulk-actions";
import { listAllOrders } from "@/modules/orders/service";

function formatMoney(amountMinor: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency
  }).format(amountMinor / 100);
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

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.3em] text-blue-600">Commerce</p>
          <h2 className="mt-3 text-4xl font-semibold tracking-tight">Orders</h2>
          <p className="mt-2 max-w-3xl text-sm text-slate-600">
            Monitor customer orders, inspect fulfillment status, and prepare manual interventions.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <article className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Orders</p>
            <p className="mt-2 text-2xl font-semibold">{filtered.length}</p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Value</p>
            <p className="mt-2 text-2xl font-semibold">{formatMoney(totalMinor, filtered[0]?.currency ?? "USD")}</p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Pending</p>
            <p className="mt-2 text-2xl font-semibold">
              {filtered.filter((order) => order.paymentStatus === "pending" || order.paymentStatus === "unpaid").length}
            </p>
          </article>
        </div>
      </div>

      <form className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:grid-cols-4">
        <input
          name="q"
          defaultValue={typeof params.q === "string" ? params.q : ""}
          placeholder="Search order number or email"
          className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
        />
        <input
          name="status"
          defaultValue={status}
          placeholder="Status"
          className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
        />
        <input
          name="paymentStatus"
          defaultValue={paymentStatus}
          placeholder="Payment status"
          className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
        />
        <input
          name="fulfillmentStatus"
          defaultValue={fulfillmentStatus}
          placeholder="Fulfillment status"
          className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
        />
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
    </section>
  );
}
