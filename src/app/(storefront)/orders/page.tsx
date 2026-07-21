import Link from "next/link";
import { listOrdersByEmail } from "@/modules/orders/service";

export default async function OrdersLookupPage() {
  const orders = await listOrdersByEmail("demo@example.com");

  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <div className="space-y-3">
        <p className="text-sm font-medium uppercase tracking-[0.3em] text-blue-600">
          Orders
        </p>
        <h1 className="text-4xl font-semibold tracking-tight">Lookup order by email</h1>
        <p className="max-w-2xl text-lg leading-8 text-slate-600">
          Tra cứu đơn hàng bằng email. Magic link và email song ngữ sẽ được bổ sung
          ở phase tiếp theo.
        </p>
      </div>
      <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        {orders.length === 0 ? (
          <p className="text-sm text-slate-600">
            No saved orders yet. Chưa có đơn hàng nào trong hệ thống.
          </p>
        ) : (
          <ul className="space-y-4">
            {orders.map((order) => (
              <li key={order.id} className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{order.orderNumber}</p>
                  <p className="text-sm text-slate-500">{order.customerEmail}</p>
                </div>
                <span className="text-sm text-slate-600">{order.status}</span>
              </li>
            ))}
          </ul>
        )}
        <Link href="/checkout" className="mt-6 inline-flex text-sm font-medium text-blue-600">
          Go to checkout / Đi tới checkout
        </Link>
      </div>
    </main>
  );
}
