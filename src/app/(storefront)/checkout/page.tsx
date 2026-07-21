import Link from "next/link";

const sampleCheckoutItems = [
  {
    name: "Hang Cú Video License - 30 Days",
    slug: "skyline-after-rain",
    price: "USD 49.00"
  }
];

export default function CheckoutPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="space-y-6">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.3em] text-blue-600">
              Checkout
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight">
              Review your license order
            </h1>
            <p className="mt-4 text-lg leading-8 text-slate-600">
              Kiểm tra lại thông tin gói license trước khi thanh toán.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="space-y-4">
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Email</span>
                <input
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none ring-0 focus:border-blue-500"
                  type="email"
                  placeholder="you@example.com"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Full name</span>
                <input
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none ring-0 focus:border-blue-500"
                  type="text"
                  placeholder="Optional"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Coupon code / Mã giảm giá</span>
                <input
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none ring-0 focus:border-blue-500"
                  type="text"
                  placeholder="Optional"
                />
              </label>
            </div>
          </div>
        </section>
        <aside className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Order summary / Tóm tắt đơn hàng</h2>
            <ul className="mt-4 space-y-4">
              {sampleCheckoutItems.map((item) => (
                <li key={item.slug} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-slate-500">{item.slug}</p>
                  </div>
                  <span className="text-sm font-medium">{item.price}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-600">
              Thanh toán sẽ được kết nối ở phase tiếp theo. Hiện tại đây là khung
              checkout cho license store.
            </p>
            <Link
              href="/products"
              className="mt-4 inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white"
            >
              Back to license plans
            </Link>
          </div>
        </aside>
      </div>
    </main>
  );
}
