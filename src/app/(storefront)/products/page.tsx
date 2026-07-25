import Link from "next/link";
import { listProducts } from "@/modules/products/service";
import { getStorefrontLocale, getLocalizedText } from "@/modules/i18n/storefront";

export default async function ProductsPage() {
  const products = await listProducts();
  const locale = await getStorefrontLocale();

  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <div className="space-y-3">
        <p className="text-sm font-medium text-blue-600">
          {locale === "vi" ? "Gói license" : "License plans"}
        </p>
        <h1 className="text-4xl font-semibold tracking-tight">
          {locale === "vi" ? "Duyệt các gói license đang mở bán" : "Browse available license plans"}
        </h1>
        <p className="max-w-2xl text-base leading-7 text-slate-600">
          {locale === "vi"
            ? "Duyệt license 30 ngày, license trọn đời và gói hỗ trợ tách biệt."
            : "Browse the 30-day license, lifetime license, and the separate support package."}
        </p>
      </div>
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <article
            key={product.id}
            className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
          >
            <div className="aspect-[4/5] bg-slate-100" />
            <div className="space-y-3 p-5">
              <div>
                <p className="text-xs font-medium text-slate-500">
                  {product.sku}
                </p>
                <h2 className="mt-2 text-xl font-semibold">{product.name}</h2>
              </div>
              <p className="text-sm leading-6 text-slate-600">
                {product.shortDescription}
              </p>
              <p className="text-sm font-medium text-slate-950">
                {product.currency} {(product.amountMinor / 100).toFixed(2)}
              </p>
              <Link
                className="inline-flex text-sm font-medium text-blue-600"
                href={`/products/${product.slug}`}
              >
                {locale === "vi" ? "Xem chi tiết license" : "View license details"}
              </Link>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
