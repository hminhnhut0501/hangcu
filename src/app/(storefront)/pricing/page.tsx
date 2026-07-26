import Link from "next/link";
import { listLicensePlans } from "@/modules/license-plans/service";
import { getStorefrontLocale } from "@/modules/i18n/storefront";
import { getPrimaryStoreCurrency } from "@/lib/money/format";
import { StaticPage } from "@/components/storefront/static-page";
import { MoneyAmount } from "@/components/money/money-amount";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function PricingPage() {
  const locale = await getStorefrontLocale();
  const vi = locale === "vi";
  const plans = (await listLicensePlans())
    .filter((plan) => plan.status === "active" && (plan.code === "HCV_30D" || plan.code === "HCV_LIFETIME" || plan.durationDays === 30 || plan.isLifetime))
    .sort((a, b) => a.sortOrder - b.sortOrder);
  const primaryCurrency = getPrimaryStoreCurrency(locale);

  return (
    <StaticPage
      eyebrow={vi ? "Bảng giá" : "Pricing"}
      title={vi ? "Các gói license được tách theo tiền tệ" : "License pricing is separated by currency"}
      intro={
        vi
          ? "VNĐ là giá thanh toán chính cho khách Việt, USD là giá tham chiếu hoặc thanh toán quốc tế. Support package tách riêng và dùng VNĐ."
          : "USD is the main checkout currency for English storefront pricing, while VNĐ is used for Vietnamese support amounts. Support packages stay separate."
      }
      sections={[]}
      footer={
        <div className="space-y-8">
          <div className="grid gap-6 md:grid-cols-2">
            {plans.map((plan) => {
              const primaryAmount = plan.currencyPrices[primaryCurrency];
              const secondaryCurrency = primaryCurrency === "VND" ? "USD" : "VND";
              const secondaryAmount = plan.currencyPrices[secondaryCurrency];

              return (
                <article key={plan.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <p className="text-xs font-semibold text-slate-500">{plan.code}</p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-950">{vi ? plan.nameVi : plan.nameEn}</h2>
                  <p className="mt-2 text-slate-600">{plan.description}</p>
                  <div className="mt-5 rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">{vi ? "Giá chính" : "Primary price"}</p>
                    <p className="mt-2 text-3xl font-semibold text-slate-950">
                      <MoneyAmount amount={primaryAmount} currency={primaryCurrency} locale={locale} kind="catalog" />
                    </p>
                    {secondaryAmount != null ? (
                      <p className="mt-2 text-sm text-slate-500">
                        {secondaryCurrency}: <MoneyAmount amount={secondaryAmount} currency={secondaryCurrency} locale={locale} kind="catalog" />
                      </p>
                    ) : null}
                  </div>
                  <ul className="mt-4 space-y-1 text-sm text-slate-500">
                    <li>{plan.isLifetime ? (vi ? "Trọn đời" : "Lifetime") : `${plan.durationDays} ${vi ? "ngày" : "days"}`}</li>
                    <li>{vi ? "Giao key qua email" : "License delivered by email"}</li>
                    <li>{vi ? "Có thể thanh toán qua gateway phù hợp" : "Checkout uses the matching payment gateway"}</li>
                  </ul>
                  <Link href={`/checkout?planCode=${encodeURIComponent(plan.code)}`} className="mt-5 inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white">
                    {vi ? "Mua gói này" : "Buy this plan"}
                  </Link>
                </article>
              );
            })}
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-950">{vi ? "Gói hỗ trợ riêng" : "Separate support package"}</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              {vi
                ? "Gói hỗ trợ là khoản ủng hộ tự nguyện, tách biệt khỏi license và luôn giữ theo VNĐ."
                : "The support package is a voluntary contribution, separate from licenses and always kept in VNĐ."}
            </p>
          </div>
        </div>
      }
    />
  );
}
