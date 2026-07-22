import Link from "next/link";
import { CheckoutPaymentForm } from "@/components/storefront/checkout-payment-form";
import { getStorefrontLocale } from "@/modules/i18n/storefront";
import { listFeaturedProducts, listProducts } from "@/modules/products/service";

export default async function CheckoutPage() {
  const locale = await getStorefrontLocale();
  const featured = await listFeaturedProducts();
  const allProducts = await listProducts();
  const options = (featured.length > 0 ? featured : allProducts).map((product) => ({
    slug: product.slug,
    name: product.name,
    description: product.shortDescription,
    amountMinor: product.amountMinor,
    currency: product.currency
  }));

  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="space-y-6">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.3em] text-blue-600">
              {locale === "vi" ? "Thanh toán" : "Checkout"}
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight">
              {locale === "vi" ? "Thanh toán license" : "Pay for your license"}
            </h1>
            <p className="mt-4 text-lg leading-8 text-slate-600">
              {locale === "vi"
                ? "Chọn gói license và phương thức thanh toán, hiện đã có PayOS cho thanh toán chuyển khoản/QR."
                : "Choose a license plan and payment method. PayOS is now available for bank transfer and QR checkout."}
            </p>
          </div>

          <CheckoutPaymentForm locale={locale} options={options} />
        </section>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold">
              {locale === "vi" ? "Gói đang bán" : "Available plans"}
            </h2>
            <ul className="mt-4 space-y-4">
              {options.map((item) => (
                <li key={item.slug} className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-slate-500">{item.description}</p>
                  </div>
                  <span className="text-sm font-medium">
                    {item.currency} {(item.amountMinor / 100).toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-600">
              {locale === "vi"
                ? "Sau khi thanh toán, PayOS sẽ chuyển khách hàng về returnUrl và gửi webhook để hệ thống ghi nhận trạng thái."
                : "After payment, PayOS will redirect customers back to returnUrl and send a webhook so the system can record the status."}
            </p>
            <Link
              href="/products"
              className="mt-4 inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white"
            >
              {locale === "vi" ? "Xem lại gói license" : "Review license plans"}
            </Link>
          </div>
        </aside>
      </div>
    </main>
  );
}
