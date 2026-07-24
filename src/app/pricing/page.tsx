import Link from "next/link";
import { listFeaturedProducts } from "@/modules/products/service";
import { getCurrentPriceForProduct } from "@/modules/prices/service";
import { getStorefrontLocale } from "@/modules/i18n/storefront";

export default async function PricingPage() {
  const locale = await getStorefrontLocale();
  const products = await listFeaturedProducts();
  const plans = await Promise.all(products.slice(0, 2).map(async (product) => ({ product, price: await getCurrentPriceForProduct(product.id) })));
  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <div className="space-y-3">
        <p className="text-sm font-medium uppercase tracking-[0.3em] text-blue-600">{locale === "vi" ? "Bảng giá" : "Pricing"}</p>
        <h1 className="text-4xl font-semibold tracking-tight">{locale === "vi" ? "Chọn gói license phù hợp" : "Choose the right license plan"}</h1>
        <p className="max-w-2xl text-slate-600">{locale === "vi" ? "Một lần thanh toán, giao license key tự động qua email." : "One-time payment with automatic license key delivery by email."}</p>
      </div>
      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {plans.map(({ product, price }) => (
          <article key={product.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">{product.sku}</p>
            <h2 className="mt-2 text-2xl font-semibold">{product.name}</h2>
            <p className="mt-2 text-slate-600">{product.shortDescription}</p>
            <p className="mt-5 text-3xl font-semibold">${(price.amountMinor / 100).toFixed(2)}</p>
            <ul className="mt-3 space-y-1 text-sm text-slate-500">
              <li>{product.downloadExpiryDays === 30 ? (locale === "vi" ? "Không tự động gia hạn" : "No auto-renew") : (locale === "vi" ? "Không thu phí định kỳ" : "No recurring fee")}</li>
              <li>{locale === "vi" ? "License giao qua email" : "License delivered by email"}</li>
              <li>{locale === "vi" ? "Có giới hạn thiết bị" : "Device-limited activation"}</li>
            </ul>
            <Link href={`/checkout?planCode=${encodeURIComponent(product.sku)}&plan=${encodeURIComponent(product.name)}&amountMinor=${price.amountMinor}&currency=${encodeURIComponent(price.currency)}`} className="mt-5 inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white">
              {locale === "vi" ? "Mua gói này" : "Buy this plan"}
            </Link>
          </article>
        ))}
      </div>
      <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold">{locale === "vi" ? "Gói hỗ trợ tách biệt" : "Separate support package"}</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          {locale === "vi"
            ? "Gói hỗ trợ là khoản ủng hộ tự nguyện, không thay thế việc mua license và không mở khóa tính năng bí mật."
            : "The support package is a voluntary contribution. It does not replace a license purchase and does not unlock secret features."}
        </p>
      </div>
    </main>
  );
}
