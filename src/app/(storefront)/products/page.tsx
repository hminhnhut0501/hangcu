import Link from "next/link";
import { listProducts } from "@/modules/products/service";
import { getStorefrontLocale, getLocalizedText } from "@/modules/i18n/storefront";
import { supporterPackages } from "@/lib/supporter-packages";

export default async function ProductsPage() {
  const products = await listProducts();
  const locale = await getStorefrontLocale();
  const licenseProducts = products.filter((product) => product.sku === "HCV-LIC-30" || product.sku === "HCV-LIC-LIFE");
  const supportPackages = supporterPackages;

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
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
        {licenseProducts.map((product) => (
          <article
            key={product.id}
            className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(15,23,42,0.08)]"
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
                className="inline-flex rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
                href={`/checkout?planCode=${encodeURIComponent(product.sku)}`}
              >
                {locale === "vi" ? "Mua license" : "Buy license"}
              </Link>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-14 space-y-3">
        <p className="text-sm font-medium text-blue-600">
          {locale === "vi" ? "Gói support" : "Support packages"}
        </p>
        <h2 className="text-3xl font-semibold tracking-tight">
          {locale === "vi" ? "Các gói support tách riêng khỏi license" : "Support packages are separate from licenses"}
        </h2>
        <p className="max-w-2xl text-base leading-7 text-slate-600">
          {locale === "vi"
            ? "Các gói này chỉ là ủng hộ, không thay thế license 30 ngày hoặc trọn đời."
            : "These packages are support-only and do not replace the 30-day or lifetime licenses."}
        </p>
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {supportPackages.map((packageItem) => (
          <article
            key={packageItem.slug}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(15,23,42,0.08)]"
          >
            <p className="text-sm text-slate-500">{packageItem.slug}</p>
            <h3 className="mt-2 text-xl font-semibold">
              {locale === "vi" ? packageItem.nameVi : packageItem.nameEn}
            </h3>
            <p className="mt-2 text-sm font-medium text-slate-900">
              {packageItem.currency} {(packageItem.amountMinor / 100).toLocaleString(locale === "vi" ? "vi-VN" : "en-US")}
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {locale === "vi" ? packageItem.descriptionVi : packageItem.descriptionEn}
            </p>
            <Link
              href={`/checkout?package=${encodeURIComponent(packageItem.slug)}`}
              className="mt-4 inline-flex rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              {locale === "vi" ? "Mua support" : "Buy support"}
            </Link>
          </article>
        ))}
      </div>
    </main>
  );
}
