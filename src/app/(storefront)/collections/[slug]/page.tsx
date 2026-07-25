import Link from "next/link";
import { getStorefrontLocale } from "@/modules/i18n/storefront";
import { getSupporterPackageBySlug } from "@/lib/supporter-packages";

type CollectionDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function CollectionDetailPage({
  params
}: CollectionDetailPageProps) {
  const { slug } = await params;
  const locale = await getStorefrontLocale();
  const packageItem = getSupporterPackageBySlug(slug);

  if (!packageItem) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-16">
        <p className="text-sm font-medium text-blue-600">
          {locale === "vi" ? "Gói ủng hộ" : "Supporter packages"}
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">
          {locale === "vi" ? "Không tìm thấy gói này" : "Package not found"}
        </h1>
        <p className="mt-4 text-lg leading-8 text-slate-600">
          {locale === "vi"
            ? "Vui lòng quay lại danh sách gói và chọn một gói mẫu."
            : "Please go back to the package list and choose one of the sample packages."}
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <div className="space-y-3">
        <p className="text-sm font-medium text-blue-600">
          {locale === "vi" ? "Gói ủng hộ" : "Supporter package"}
        </p>
        <h1 className="text-4xl font-semibold tracking-tight">
          {locale === "vi" ? packageItem.nameVi : packageItem.nameEn}
        </h1>
        <p className="max-w-2xl text-lg leading-8 text-slate-600">
          {locale === "vi" ? packageItem.descriptionVi : packageItem.descriptionEn}
        </p>
        <p className="max-w-2xl text-base leading-7 text-slate-600">
          {locale === "vi"
            ? "Đây là gói mẫu để khách chọn nhanh rồi sang checkout ngay."
            : "This is a sample package customers can pick before going straight to checkout."}
        </p>
      </div>
      <div className="mt-10 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            {locale === "vi" ? "Mức đóng góp" : "Contribution"}
          </p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
            {packageItem.currency} {(packageItem.amountMinor / 100).toLocaleString(locale === "vi" ? "vi-VN" : "en-US")}
          </p>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            {locale === "vi"
              ? "Chọn gói này sẽ đưa bạn sang checkout với gói đã được điền sẵn."
              : "Choosing this package will take you to checkout with the package prefilled."}
          </p>
          <Link
            href={`/checkout?package=${encodeURIComponent(packageItem.slug)}`}
            className="mt-6 inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white"
          >
            {locale === "vi" ? "Đi tới checkout" : "Go to checkout"}
          </Link>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            {locale === "vi" ? "Thông tin nhanh" : "Quick facts"}
          </p>
          <dl className="mt-4 space-y-4 text-sm">
            <div className="flex items-start justify-between gap-6 border-b border-slate-200 pb-3">
              <dt className="text-slate-500">{locale === "vi" ? "Mã gói" : "Package code"}</dt>
              <dd className="font-medium text-slate-950">{packageItem.slug}</dd>
            </div>
            <div className="flex items-start justify-between gap-6 border-b border-slate-200 pb-3">
              <dt className="text-slate-500">{locale === "vi" ? "Cổng thanh toán" : "Gateway"}</dt>
              <dd className="font-medium text-slate-950">PayOS / PayPal / Lemon Squeezy</dd>
            </div>
            <div className="flex items-start justify-between gap-6">
              <dt className="text-slate-500">{locale === "vi" ? "Luồng" : "Flow"}</dt>
              <dd className="font-medium text-slate-950">
                {locale === "vi" ? "Chọn gói -> nhập email -> chọn cổng -> thanh toán" : "Choose package -> enter email -> select gateway -> pay"}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </main>
  );
}
