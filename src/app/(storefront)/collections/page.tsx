import Link from "next/link";
import { getStorefrontLocale } from "@/modules/i18n/storefront";
import { supporterPackages } from "@/lib/supporter-packages";

export default async function CollectionsPage() {
  const locale = await getStorefrontLocale();
  const packages = supporterPackages;

  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <div className="space-y-3">
        <p className="text-sm font-medium text-blue-600">
          {locale === "vi" ? "Ủng hộ tự do" : "Flexible support"}
        </p>
        <h1 className="text-4xl font-semibold tracking-tight">
          {locale === "vi" ? "Chọn mức ủng hộ bạn muốn" : "Choose how much you want to support"}
        </h1>
        <p className="max-w-2xl text-base leading-7 text-slate-600">
          {locale === "vi"
            ? "Chọn một mức gợi ý hoặc vào checkout để tự nhập số tiền ủng hộ."
            : "Pick a suggested level or go to checkout to enter your own support amount."}
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
              {locale === "vi" ? "Chọn mức này" : "Choose this amount"}
            </Link>
          </article>
        ))}
      </div>
    </main>
  );
}
