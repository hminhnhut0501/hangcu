import React from "react";
import Link from "next/link";
import { CheckoutPaymentForm } from "@/components/storefront/checkout-payment-form";
import { getStorefrontLocale } from "@/modules/i18n/storefront";
import { getOrderByOrderNumber } from "@/modules/orders/service";
import { listLicensePlans } from "@/modules/license-plans/service";
import { getDonatePackageBySlug, listDonatePackages } from "@/modules/donate-packages/service";
import { mapDonatePackageToViewModel } from "@/modules/donate-packages/view-model";
import { MoneyAmount } from "@/components/money/money-amount";
import { licensePlansSeed } from "@/lib/license/mock-data";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type CheckoutSearchParams = {
  order?: string | string[];
  planCode?: string | string[];
  plan?: string | string[];
  amount?: string | string[];
  amountMinor?: string | string[];
  currency?: string | string[];
  checkout?: string | string[];
  customerRef?: string | string[];
  status?: string | string[];
  orderCode?: string | string[];
  code?: string | string[];
  package?: string | string[];
};

function firstValue(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0];
  return value;
}

function parseAmountMinor(value: string | undefined) {
  if (!value) return null;
  const numeric = Number(value);
  return Number.isFinite(numeric) && numeric >= 0 ? numeric : null;
}

function normalizeCheckoutStatus(value: string | undefined) {
  const status = String(value || "").trim().toUpperCase();
  if (["PAID", "SUCCESS", "SUCCEEDED", "COMPLETED", "00"].includes(status)) return "paid";
  if (["FAILED", "ERROR", "CANCELLED", "CANCELED"].includes(status)) return "failed";
  return "";
}

export default async function CheckoutPage({
  searchParams
}: {
  searchParams?: Promise<CheckoutSearchParams>;
}) {
  const locale = await getStorefrontLocale();
  const resolvedSearchParams = (await searchParams) ?? {};
  const orderNumber = firstValue(resolvedSearchParams.order);
  const planCode = firstValue(resolvedSearchParams.planCode);
  const planLabel = firstValue(resolvedSearchParams.plan) ?? planCode;
  const amountMinorQuery = parseAmountMinor(firstValue(resolvedSearchParams.amountMinor));
  const amountMinorParam = parseAmountMinor(firstValue(resolvedSearchParams.amountMinor));
  const checkoutId = firstValue(resolvedSearchParams.checkout);
  const customerRef = firstValue(resolvedSearchParams.customerRef);
  const status = normalizeCheckoutStatus(firstValue(resolvedSearchParams.status) ?? firstValue(resolvedSearchParams.code));
  const returnedOrderCode = firstValue(resolvedSearchParams.orderCode);
  const order = orderNumber ? await getOrderByOrderNumber(orderNumber) : null;
  const resolvedOrderLabel = order?.items?.[0]?.productName ?? (order?.metadata?.planName as string | undefined) ?? null;
  const resolvedCustomerRef = customerRef ?? (order?.metadata?.customerRef as string | undefined) ?? null;
  const resolvedPlanCode = planLabel ?? (order?.metadata?.planCode as string | undefined) ?? null;
  const summaryPlan = planLabel ?? resolvedOrderLabel ?? resolvedPlanCode;
  const summaryAmountMinor = amountMinorParam ?? order?.totalMinor ?? amountMinorQuery ?? null;
  const summaryAmountCurrency = firstValue(resolvedSearchParams.currency) ?? order?.currency ?? null;
  const selectedPackageSlug = firstValue(resolvedSearchParams.package);
  const selectedPackage = selectedPackageSlug ? await getDonatePackageBySlug(selectedPackageSlug).catch(() => null) : null;
  const selectedPackageView = selectedPackage ? mapDonatePackageToViewModel(selectedPackage, locale) : null;
  const catalogPlans = (await listLicensePlans())
    .filter((plan) => plan.status === "active" && (plan.code === "HCV_30D" || plan.code === "HCV_LIFETIME" || plan.durationDays === 30 || plan.isLifetime))
    .sort((a, b) => a.sortOrder - b.sortOrder);
  const fallbackPlans = licensePlansSeed
    .filter((plan) => plan.status === "active" && (plan.code === "HCV_30D" || plan.code === "HCV_LIFETIME" || plan.durationDays === 30 || plan.isLifetime))
    .sort((a, b) => a.sortOrder - b.sortOrder);
  const licenseSourcePlans = catalogPlans.length > 0 ? catalogPlans : fallbackPlans;
  const licenseProducts = licenseSourcePlans.map((plan) => ({
      slug: plan.code,
      code: plan.code,
      kind: "license" as const,
      name: locale === "vi" ? plan.nameVi : plan.nameEn,
      description: plan.description,
      amountMinor: locale === "vi" ? (plan.currencyPrices.VND ?? 0) : Math.round((plan.currencyPrices.USD ?? 0) * 100),
      currency: locale === "vi" ? "VND" : "USD"
    }));
  const supportPackages = (await listDonatePackages())
    .filter((item) => item.status === "active" && (item.vndAmountMinor != null || item.usdAmountMinor != null))
    .map((item) => mapDonatePackageToViewModel(item, locale));
  const supportOptions = supportPackages.map((item) => ({
    slug: item.slug,
    code: item.code,
    kind: "support" as const,
    name: item.name,
    description: item.description,
    amountMinor: item.amountMinor ?? 0,
    currency: item.currency ?? "VND"
  }));
  const packageOptions = [...licenseProducts, ...supportOptions];
  const initialMode = selectedPackage
    ? "support"
    : firstValue(resolvedSearchParams.planCode)
      ? licenseProducts.some((option) => option.slug === firstValue(resolvedSearchParams.planCode))
        ? "license"
        : "support"
      : selectedPackageSlug
        ? "support"
        : "license";
  const initialPackage = selectedPackage
    ? {
        slug: selectedPackageView?.slug ?? selectedPackage.slug,
        code: selectedPackageView?.code ?? selectedPackage.code,
        kind: "support" as const,
        name: selectedPackageView?.name ?? selectedPackage.name,
        description: selectedPackageView?.description ?? selectedPackage.description,
        amountMinor: selectedPackageView?.amountMinor ?? selectedPackage.suggestedAmountMinor,
        currency: selectedPackageView?.currency ?? selectedPackage.currency
      }
    : firstValue(resolvedSearchParams.planCode)
      ? packageOptions.find((option) => option.slug === firstValue(resolvedSearchParams.planCode)) ?? packageOptions[0] ?? null
      : packageOptions[0] ?? null;
  const selectedCheckoutPackage = initialPackage ?? packageOptions[0] ?? null;

  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="space-y-6">
          <div>
            <p className="text-sm font-medium text-blue-600">
              {locale === "vi" ? "Thanh toán" : "Checkout"}
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight">
              {locale === "vi" ? "Thanh toán gói license hoặc ủng hộ tự do" : "Pay for a license or a flexible support contribution"}
            </h1>
            <p className="mt-4 text-lg leading-8 text-slate-600">
              {locale === "vi"
                ? "Chọn một gói, nhập email, rồi bấm tiếp tục để sang cổng thanh toán."
                : "Pick a package, enter your email, then continue to the payment gateway."}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-[0.28em] text-slate-400">{locale === "vi" ? "Bước 1" : "Step 1"}</p>
              <p className="mt-2 text-sm font-semibold text-slate-950">{locale === "vi" ? "Chọn gói" : "Choose a pack"}</p>
              <p className="mt-1 text-sm text-slate-600">{locale === "vi" ? "License hoặc support." : "License or support."}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-[0.28em] text-slate-400">{locale === "vi" ? "Bước 2" : "Step 2"}</p>
              <p className="mt-2 text-sm font-semibold text-slate-950">{locale === "vi" ? "Nhập email" : "Enter email"}</p>
              <p className="mt-1 text-sm text-slate-600">{locale === "vi" ? "Nhận hóa đơn và key." : "Get receipt and key."}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-[0.28em] text-slate-400">{locale === "vi" ? "Bước 3" : "Step 3"}</p>
              <p className="mt-2 text-sm font-semibold text-slate-950">{locale === "vi" ? "Thanh toán" : "Pay"}</p>
              <p className="mt-1 text-sm text-slate-600">{locale === "vi" ? "Đi tới cổng phù hợp." : "Continue to gateway."}</p>
            </div>
          </div>

          {selectedCheckoutPackage ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-medium text-slate-500">{locale === "vi" ? "Đang chọn" : "Selected"}</p>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <p className="text-base font-semibold text-slate-950">{selectedCheckoutPackage.name}</p>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                  <MoneyAmount amount={selectedCheckoutPackage.amountMinor} currency={selectedCheckoutPackage.currency} locale={locale} />
                </span>
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-600">{selectedCheckoutPackage.description}</p>
            </div>
          ) : null}

          {orderNumber || summaryPlan || summaryAmountMinor != null || checkoutId || resolvedCustomerRef ? (
            <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5 shadow-sm">
              <div className="flex flex-wrap items-center gap-2 text-sm font-medium text-blue-700">
                <span>{locale === "vi" ? "Thông tin từ bot" : "Bot checkout context"}</span>
                <span className="rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white">
                  {locale === "vi" ? "Nguồn từ bot" : "From bot"}
                </span>
                {orderNumber ? <span className="rounded-full bg-white px-3 py-1 text-blue-700 ring-1 ring-blue-200">#{orderNumber}</span> : null}
                {checkoutId ? <span className="rounded-full bg-white px-3 py-1 text-blue-700 ring-1 ring-blue-200">{checkoutId}</span> : null}
              </div>
              <div className="mt-4 grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
                {summaryPlan ? (
                  <div className="rounded-xl bg-white p-4 ring-1 ring-blue-100">
                    <p className="text-xs font-medium text-slate-500">{locale === "vi" ? "Gói" : "Plan"}</p>
                    <p className="mt-1 text-base font-semibold text-slate-900">{summaryPlan}</p>
                  </div>
                ) : null}
                {summaryAmountMinor != null && summaryAmountCurrency ? (
                  <div className="rounded-xl bg-white p-4 ring-1 ring-blue-100">
                    <p className="text-xs font-medium text-slate-500">{locale === "vi" ? "Số tiền" : "Amount"}</p>
                    <p className="mt-1 text-base font-semibold text-slate-900">
                      <MoneyAmount amount={summaryAmountMinor} currency={summaryAmountCurrency} locale={locale} />
                    </p>
                  </div>
                ) : null}
                {resolvedCustomerRef ? (
                  <div className="rounded-xl bg-white p-4 ring-1 ring-blue-100 sm:col-span-2">
                    <p className="text-xs font-medium text-slate-500">{locale === "vi" ? "Mã khách" : "Customer ref"}</p>
                    <p className="mt-1 text-base font-semibold text-slate-900">{resolvedCustomerRef}</p>
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}

          {status === "paid" ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
              <p className="text-sm font-medium text-emerald-700">
                {locale === "vi" ? "✅ Thanh toán đã ghi nhận" : "✅ Payment recorded"}
              </p>
              <p className="mt-2 text-sm leading-6 text-emerald-900">
                {locale === "vi"
                  ? "Web đã nhận trạng thái thanh toán thành công. Bot sẽ gửi link license và link vào group ngay khi webhook xử lý xong."
                  : "The web has received the successful payment status. The bot will send the license and group links as soon as the webhook finishes processing."}
              </p>
              {returnedOrderCode ? (
                <p className="mt-2 text-xs text-emerald-700">
                  {locale === "vi" ? "Mã thanh toán:" : "Payment code:"} <code>{returnedOrderCode}</code>
                </p>
              ) : null}
            </div>
          ) : null}

          {status === "failed" ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 shadow-sm">
              <p className="text-sm font-medium text-rose-700">
                {locale === "vi" ? "⚠️ Thanh toán chưa hoàn tất" : "⚠️ Payment not completed"}
              </p>
              <p className="mt-2 text-sm leading-6 text-rose-900">
                {locale === "vi"
                  ? "Nếu bạn đã chuyển khoản nhưng chưa thấy cấp quyền, vui lòng chờ vài chục giây để webhook đồng bộ hoặc bấm thử lại từ trang đơn hàng."
                  : "If you already paid but no license appears yet, please wait a few seconds for the webhook to sync or retry from the order page."}
              </p>
            </div>
          ) : null}

          <CheckoutPaymentForm
            locale={locale}
            licenseOptions={licenseProducts}
            supportOptions={supportOptions}
            initialSelectedSlug={initialPackage?.slug ?? ""}
            initialMode={initialMode}
            initialEmail=""
            orderSummary={{
              orderNumber,
              checkoutId,
              planCode: planCode ?? (order?.metadata?.planCode as string | undefined) ?? null,
              planLabel: summaryPlan,
              amountLabel: summaryAmountMinor != null && summaryAmountCurrency ? `${summaryAmountMinor} ${summaryAmountCurrency}` : null,
              customerRef: resolvedCustomerRef,
              amountMinor: amountMinorParam ?? order?.totalMinor ?? null,
              currency: firstValue(resolvedSearchParams.currency) ?? order?.currency ?? null
            }}
          />
        </section>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-600">
              {locale === "vi"
                ? "Sau khi thanh toán, web sẽ ghi nhận đơn, trạng thái và mã lic để bot cấp quyền tự động."
                : "After payment, the web records the order, status, and license code so the bot can fulfill it automatically."}
            </p>
            <Link
              href="/orders"
              className="mt-4 inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white"
            >
              {locale === "vi" ? "Xem đơn hàng" : "View orders"}
            </Link>
          </div>
        </aside>
      </div>
    </main>
  );
}
