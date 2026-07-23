import Link from "next/link";
import { CheckoutPaymentForm } from "@/components/storefront/checkout-payment-form";
import { getStorefrontLocale } from "@/modules/i18n/storefront";
import { getOrderByOrderNumber } from "@/modules/orders/service";
import { listFeaturedProducts, listProducts } from "@/modules/products/service";

type CheckoutSearchParams = {
  order?: string | string[];
  planCode?: string | string[];
  plan?: string | string[];
  amount?: string | string[];
  currency?: string | string[];
  checkout?: string | string[];
  customerRef?: string | string[];
};

function firstValue(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0];
  return value;
}

function formatCurrencyLabel(amount: string | undefined, currency: string | undefined, locale: "vi" | "en") {
  if (!amount || !currency) return null;
  const normalizedCurrency = currency.toUpperCase();
  const numericAmount = Number(amount);
  if (!Number.isFinite(numericAmount)) {
    return null;
  }

  if (normalizedCurrency === "VND") {
    return locale === "vi"
      ? `${new Intl.NumberFormat("vi-VN").format(numericAmount)}đ`
      : `${new Intl.NumberFormat("en-US").format(numericAmount)} VND`;
  }

  return `${new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(numericAmount)} ${normalizedCurrency}`;
}

function formatMinorAmount(amountMinor: number | undefined, currency: string | undefined, locale: "vi" | "en") {
  if (amountMinor == null || !currency) return null;
  const normalizedCurrency = currency.toUpperCase();
  if (normalizedCurrency === "VND") {
    return locale === "vi"
      ? `${new Intl.NumberFormat("vi-VN").format(amountMinor)}đ`
      : `${new Intl.NumberFormat("en-US").format(amountMinor)} VND`;
  }

  return `${new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amountMinor / 100)} ${normalizedCurrency}`;
}

export default async function CheckoutPage({
  searchParams
}: {
  searchParams?: CheckoutSearchParams;
}) {
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
  const orderNumber = firstValue(searchParams?.order);
  const planCode = firstValue(searchParams?.planCode);
  const planLabel = firstValue(searchParams?.plan) ?? planCode;
  const amountLabel = formatCurrencyLabel(firstValue(searchParams?.amount), firstValue(searchParams?.currency), locale);
  const checkoutId = firstValue(searchParams?.checkout);
  const customerRef = firstValue(searchParams?.customerRef);
  const order = orderNumber ? await getOrderByOrderNumber(orderNumber) : null;
  const resolvedOrderLabel = order?.items?.[0]?.productName ?? order?.metadata?.planName ?? null;
  const resolvedAmountLabel = formatMinorAmount(order?.totalMinor, order?.currency, locale);
  const resolvedCustomerRef = customerRef ?? (order?.metadata?.customerRef as string | undefined) ?? null;
  const resolvedPlanCode = planLabel ?? (order?.metadata?.planCode as string | undefined) ?? null;
  const summaryAmount = amountLabel ?? resolvedAmountLabel;
  const summaryPlan = planLabel ?? resolvedOrderLabel ?? resolvedPlanCode;

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

          {orderNumber || summaryPlan || summaryAmount || checkoutId || resolvedCustomerRef ? (
            <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5 shadow-sm">
              <div className="flex flex-wrap items-center gap-2 text-sm font-medium text-blue-700">
                <span>{locale === "vi" ? "Thông tin từ bot" : "Bot checkout context"}</span>
                {orderNumber ? <span className="rounded-full bg-white px-3 py-1 text-blue-700 ring-1 ring-blue-200">#{orderNumber}</span> : null}
                {checkoutId ? <span className="rounded-full bg-white px-3 py-1 text-blue-700 ring-1 ring-blue-200">{checkoutId}</span> : null}
              </div>
              <div className="mt-4 grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
                {summaryPlan ? (
                  <div className="rounded-xl bg-white p-4 ring-1 ring-blue-100">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{locale === "vi" ? "Gói" : "Plan"}</p>
                    <p className="mt-1 text-base font-semibold text-slate-900">{summaryPlan}</p>
                  </div>
                ) : null}
                {summaryAmount ? (
                  <div className="rounded-xl bg-white p-4 ring-1 ring-blue-100">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{locale === "vi" ? "Số tiền" : "Amount"}</p>
                    <p className="mt-1 text-base font-semibold text-slate-900">{summaryAmount}</p>
                  </div>
                ) : null}
                {resolvedCustomerRef ? (
                  <div className="rounded-xl bg-white p-4 ring-1 ring-blue-100 sm:col-span-2">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{locale === "vi" ? "Mã khách" : "Customer ref"}</p>
                    <p className="mt-1 text-base font-semibold text-slate-900">{resolvedCustomerRef}</p>
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}

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
