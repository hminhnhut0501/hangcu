import Link from "next/link";
import { listLicensePlans } from "@/modules/license-plans/service";
import { getStorefrontLocale, getLocalizedText } from "@/modules/i18n/storefront";
import { supporterPackages } from "@/lib/supporter-packages";

export default async function ProductsPage() {
  const plans = (await listLicensePlans())
    .filter((plan) => plan.status === "active" && (plan.code === "HCV_30D" || plan.code === "HCV_LIFETIME" || plan.durationDays === 30 || plan.isLifetime))
    .sort((a, b) => a.sortOrder - b.sortOrder);
  const locale = await getStorefrontLocale();
  const supportPackages = supporterPackages;

  const formatMoney = (amountMinor: number | null, currency: string) => {
    if (amountMinor == null) return null;
    if (currency === "VND") {
      return `${new Intl.NumberFormat(locale === "vi" ? "vi-VN" : "en-US").format(amountMinor)}${locale === "vi" ? "đ" : " VND"}`;
    }
    return `${new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amountMinor / 100)} ${currency}`;
  };

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
          ? "Duyệt license 30 ngày, license trọn đời và mục ủng hộ tự do."
          : "Browse the 30-day license, lifetime license, and the flexible support option."}
        </p>
      </div>
      <div className="mt-10 grid gap-4 lg:grid-cols-2">
        {plans.map((plan) => (
          <article
            key={plan.id}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(15,23,42,0.08)]"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-2">
                <p className="text-xs font-medium text-slate-500">{plan.code}</p>
                <h2 className="text-xl font-semibold text-slate-950">{locale === "vi" ? plan.nameVi : plan.nameEn}</h2>
                <p className="max-w-xl text-sm leading-6 text-slate-600">{plan.description}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 px-4 py-3 text-right">
                <p className="text-xs font-medium text-slate-500">{locale === "vi" ? "Giá" : "Price"}</p>
                <p className="mt-1 text-lg font-semibold text-slate-950">
                  {formatMoney(locale === "vi" ? plan.currencyPrices.VND : plan.currencyPrices.USD, locale === "vi" ? "VND" : "USD") ?? "-"}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {plan.isLifetime ? (locale === "vi" ? "Trọn đời" : "Lifetime") : `${plan.durationDays} ${locale === "vi" ? "ngày" : "days"}`}
                </p>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Link
                className="inline-flex rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
                href={`/checkout?planCode=${encodeURIComponent(plan.code)}`}
              >
                {locale === "vi" ? "Mua license" : "Buy license"}
              </Link>
              <span className="rounded-full border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600">
                {locale === "vi" ? "Cấp key tự động" : "Auto delivery"}
              </span>
              <span className="rounded-full border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600">
                {locale === "vi" ? "1-2 máy" : "1-2 Macs"}
              </span>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-14 space-y-3">
        <p className="text-sm font-medium text-blue-600">
          {locale === "vi" ? "Ủng hộ tự do" : "Flexible support"}
        </p>
        <h2 className="text-3xl font-semibold tracking-tight">
          {locale === "vi" ? "Phần ủng hộ tách riêng khỏi license" : "Support is separate from licenses"}
        </h2>
        <p className="max-w-2xl text-base leading-7 text-slate-600">
          {locale === "vi"
            ? "Khách tự nhập số tiền ủng hộ, không thay thế license 30 ngày hoặc trọn đời."
            : "Customers enter their own support amount. It does not replace the 30-day or lifetime licenses."}
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
              {locale === "vi" ? "Ủng hộ" : "Support"}
            </Link>
          </article>
        ))}
      </div>
    </main>
  );
}
