import Link from "next/link";
import { getStorefrontLocale } from "@/modules/i18n/storefront";
import { supporterPackages } from "@/lib/supporter-packages";

export default async function CollectionsPage() {
  const locale = await getStorefrontLocale();
  const packages = supporterPackages;

  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <div className="space-y-3">
        <p className="text-sm font-medium uppercase tracking-[0.3em] text-blue-600">
          {locale === "vi" ? "Gói ủng hộ" : "Supporter packages"}
        </p>
        <h1 className="text-4xl font-semibold tracking-tight">
          {locale === "vi" ? "Chọn gói ủng hộ phù hợp" : "Choose a support package"}
        </h1>
        <p className="max-w-2xl text-base leading-7 text-slate-600">
          {locale === "vi"
            ? "Chọn một gói mẫu, chuyển thẳng sang checkout và thanh toán bằng cổng phù hợp."
            : "Pick a package, go straight to checkout, and pay with your preferred gateway."}
        </p>
      </div>
      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {packages.map((packageItem) => (
          <article
            key={packageItem.slug}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <p className="text-sm text-slate-500">{packageItem.slug}</p>
            <h2 className="mt-2 text-xl font-semibold">
              {locale === "vi" ? packageItem.nameVi : packageItem.nameEn}
            </h2>
            <p className="mt-2 text-sm font-medium text-slate-900">
              {packageItem.currency} {(packageItem.amountMinor / 100).toLocaleString(locale === "vi" ? "vi-VN" : "en-US")}
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {locale === "vi" ? packageItem.descriptionVi : packageItem.descriptionEn}
            </p>
            <Link
              href={`/checkout?package=${encodeURIComponent(packageItem.slug)}`}
              className="mt-4 inline-flex text-sm font-medium text-blue-600"
            >
              {locale === "vi" ? "Chọn gói này" : "Choose this package"}
            </Link>
          </article>
        ))}
      </div>
    </main>
  );
}
