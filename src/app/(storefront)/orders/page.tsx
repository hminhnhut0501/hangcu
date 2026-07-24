import Link from "next/link";
import { listOrdersByEmail } from "@/modules/orders/service";
import { getStorefrontLocale } from "@/modules/i18n/storefront";

type OrdersLookupSearchParams = {
  email?: string | string[];
};

function firstValue(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0];
  return value;
}

export default async function OrdersLookupPage({
  searchParams
}: {
  searchParams?: Promise<OrdersLookupSearchParams>;
}) {
  const locale = await getStorefrontLocale();
  const resolvedSearchParams = (await searchParams) ?? {};
  const email = firstValue(resolvedSearchParams.email)?.trim() ?? "";
  const orders = email ? await listOrdersByEmail(email) : [];

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
            ? "Nhập email đã dùng khi thanh toán để xem các đơn liên quan."
            : "Enter the email used at checkout to view matching orders."}
        </p>
      </div>
      <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <form className="grid gap-4 sm:grid-cols-[1fr_auto]" action="/orders" method="get">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">{locale === "vi" ? "Email tra cứu" : "Lookup email"}</span>
            <input
              type="email"
              name="email"
              defaultValue={email}
              placeholder={locale === "vi" ? "Nhập email thanh toán" : "Enter checkout email"}
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
            />
          </label>
          <div className="flex items-end">
            <button type="submit" className="rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white">
              {locale === "vi" ? "Tra cứu" : "Search"}
            </button>
          </div>
        </form>

        <div className="mt-6">
          {!email ? (
            <p className="text-sm text-slate-600">
              {locale === "vi" ? "Hãy nhập email để bắt đầu tra cứu." : "Enter an email to start searching."}
            </p>
          ) : orders.length === 0 ? (
            <p className="text-sm text-slate-600">
              {locale === "vi" ? "Chưa tìm thấy đơn nào khớp email này." : "No orders match this email yet."}
            </p>
          ) : (
            <ul className="space-y-4">
              {orders.map((order) => (
                <li key={order.id} className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3">
                  <div>
                    <p className="font-medium">{order.orderNumber}</p>
                    <p className="text-sm text-slate-500">{order.customerEmail}</p>
                  </div>
                  <span className="text-sm text-slate-600">{order.status}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <Link href="/checkout" className="mt-6 inline-flex text-sm font-medium text-blue-600">
          {locale === "vi" ? "Đi tới checkout" : "Go to checkout"}
        </Link>
      </div>
    </main>
  );
}
