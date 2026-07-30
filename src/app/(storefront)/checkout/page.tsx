import React from "react";
import { ShieldCheck } from "lucide-react";
import { CheckoutPaymentForm } from "@/components/storefront/checkout-payment-form";
import { getStorefrontLocale } from "@/modules/i18n/storefront";
import { getOrderByOrderNumber } from "@/modules/orders/service";
import { listLicensePlans } from "@/modules/license-plans/service";
import { getDonatePackageBySlug, listDonatePackages } from "@/modules/donate-packages/service";
import { mapDonatePackageToViewModel } from "@/modules/donate-packages/view-model";
import { getSiteContentSettings } from "@/modules/site-settings/service";
import { licensePlansSeed } from "@/lib/license/mock-data";
import { getLicenseKeyForOrder } from "@/modules/license-keys/service";
import { LicenseFulfillmentProgress } from "@/components/storefront/license-fulfillment-progress";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const mainPlanCodes = new Set(["FULL_1M", "FULL_LIFE", "HCV_30D", "HCV_LIFETIME", "HCV-LIC-30", "HCV-LIC-LIFE"]);

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
  const siteSettings = await getSiteContentSettings();
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
  const issuedLicense = order ? await getLicenseKeyForOrder(order.id) : null;
  const licenseCode = String(issuedLicense?.metadata?.activation_code ?? "").trim() ||
    String(issuedLicense?.encryptedCode ?? "").replace(/^encrypted:/, "").trim();
  const activationUrl = licenseCode
    ? `${process.env.BOT_NEW_URL?.replace(/\/$/, "") || `https://t.me/${String(process.env.BOT_USERNAME || "").replace(/^@/, "")}` || "https://t.me"}?start=lic_${encodeURIComponent(licenseCode)}`
    : "";
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
    .filter((plan) => plan.status === "active" && (mainPlanCodes.has(plan.code) || plan.durationDays === 30 || plan.isLifetime))
    .sort((a, b) => a.sortOrder - b.sortOrder);
  const fallbackPlans = licensePlansSeed
    .filter((plan) => plan.status === "active" && (mainPlanCodes.has(plan.code) || plan.durationDays === 30 || plan.isLifetime))
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
    <main className="mx-auto max-w-6xl px-6 py-12 lg:py-16">
      <section className="space-y-6">
        <div className="max-w-3xl space-y-4">
          <p className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
            <ShieldCheck className="h-3.5 w-3.5" />
            {locale === "vi" ? "Thanh toán an toàn" : "Secure checkout"}
          </p>
          <div>
            <p className="text-sm font-medium text-blue-600">{locale === "vi" ? "Thanh toán" : "Checkout"}</p>
            <h1 className="mt-3 max-w-2xl text-4xl font-semibold tracking-tight">
              {locale === "vi" ? "Thanh toán license hoặc ủng hộ tự do" : "Pay for a license or flexible support"}
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
              {locale === "vi"
                ? "Chọn một loại mua, nhập email và đi tới cổng thanh toán phù hợp."
                : "Choose what to buy, enter your email, and continue to the matching payment gateway."}
            </p>
          </div>
        </div>

        {status === "paid" ? (
          <div className="max-w-3xl rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
            <p className="text-sm font-medium text-emerald-700">
              {issuedLicense ? (locale === "vi" ? "Thanh toán thành công" : "Payment successful") : (locale === "vi" ? "Đã ghi nhận thanh toán" : "Payment recorded")}
            </p>
            <p className="mt-2 text-sm leading-6 text-emerald-900">
              {issuedLicense
                ? (locale === "vi" ? "License đã được cấp. Email sẽ được gửi sau để bạn lưu lại thông tin." : "Your license has been issued. An email will follow with a copy of the details.")
                : (locale === "vi" ? "Thanh toán đã nhận. License đang được cấp, vui lòng tải lại trang sau vài giây." : "Payment received. Your license is being issued; refresh this page in a few seconds.")}
            </p>
            {issuedLicense ? (
              <div className="mt-4 space-y-2 rounded-xl border border-emerald-200 bg-white/70 p-4 text-sm text-emerald-950">
                <p><strong>{locale === "vi" ? "License code:" : "License code:"}</strong> <code className="font-semibold">{licenseCode}</code></p>
                <p><strong>{locale === "vi" ? "Hết hạn:" : "Expires:"}</strong> {issuedLicense.expiresAt?.toISOString() ?? (locale === "vi" ? "Trọn đời" : "Lifetime")}</p>
                {activationUrl ? <p><a className="font-semibold underline" href={activationUrl}>{locale === "vi" ? "Kích hoạt license" : "Activate license"}</a></p> : null}
              </div>
            ) : <LicenseFulfillmentProgress locale={locale} />}
            {returnedOrderCode ? (
              <p className="mt-2 text-xs text-emerald-700">
                {locale === "vi" ? "Mã thanh toán:" : "Payment code:"} <code>{returnedOrderCode}</code>
              </p>
            ) : null}
          </div>
        ) : null}

        {status === "failed" ? (
          <div className="max-w-3xl rounded-2xl border border-rose-200 bg-rose-50 p-5 shadow-sm">
            <p className="text-sm font-medium text-rose-700">
              {locale === "vi" ? "Thanh toán chưa hoàn tất" : "Payment not completed"}
            </p>
            <p className="mt-2 text-sm leading-6 text-rose-900">
              {locale === "vi"
                ? "Nếu bạn đã thanh toán nhưng chưa thấy cấp quyền, hãy chờ vài giây để webhook đồng bộ hoặc kiểm tra lại đơn hàng."
                : "If you already paid but no license appears yet, wait a few seconds for the webhook to sync or check the order page."}
            </p>
          </div>
        ) : null}

        <CheckoutPaymentForm
          locale={locale}
          licenseOptions={licenseProducts}
          supportOptions={supportOptions}
          paymentGateways={siteSettings.paymentGateways}
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
    </main>
  );
}
