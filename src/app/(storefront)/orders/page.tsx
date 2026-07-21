import Link from "next/link";
import { listOrdersByEmail } from "@/modules/orders/service";
import { getStorefrontLocale } from "@/modules/i18n/storefront";

export default async function OrdersLookupPage() {
  const orders = await listOrdersByEmail("demo@example.com");
  const locale = await getStorefrontLocale();

  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <div className="space-y-3">
        <p className="text-sm font-medium uppercase tracking-[0.3em] text-blue-600">
          {locale === "vi" ? "Đơn hàng" : "Orders"}
        </p>
        <h1 className="text-4xl font-semibold tracking-tight">
          {locale === "vi" ? "Tra cứu đơn hàng bằng email" : "Lookup order by email"}
        </h1>
        <p className="max-w-2xl text-lg leading-8 text-slate-600">
          {locale === "vi"
            ? "Tra cứu đơn hàng bằng email. Magic link và email song ngữ sẽ được bổ sung ở phase tiếp theo."
            : "Lookup orders by email. Magic links and bilingual emails will be added in the next phase."}
        </p>
      </div>
      <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        {orders.length === 0 ? (
            <p className="text-sm text-slate-600">
              {locale === "vi" ? "Chưa có đơn hàng nào trong hệ thống." : "No saved orders yet."}
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
          {locale === "vi" ? "Đi tới checkout" : "Go to checkout"}
        </Link>
      </div>
    </main>
  );
}
