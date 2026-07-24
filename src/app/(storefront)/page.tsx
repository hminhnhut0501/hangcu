import Link from "next/link";
import Image from "next/image";
import { getCurrentPriceForProduct } from "@/modules/prices/service";
import { getSiteContentSettings } from "@/modules/site-settings/service";
import { getStorefrontLocale, getLocalizedText } from "@/modules/i18n/storefront";
import { listFeaturedProducts } from "@/modules/products/service";

function formatMoney(amountMinor: number, currency: string, locale: "vi" | "en") {
  const normalizedCurrency = currency.toUpperCase();
  if (normalizedCurrency === "VND") {
    return locale === "vi"
      ? `${new Intl.NumberFormat("vi-VN").format(amountMinor)}đ`
      : `${new Intl.NumberFormat("en-US").format(amountMinor)} VND`;
  }
  return `${new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amountMinor / 100)} ${normalizedCurrency}`;
}

export default async function HomePage() {
  const settings = await getSiteContentSettings();
  const locale = await getStorefrontLocale();
  const featuredProducts = await listFeaturedProducts();
  const heroImageUrl = settings.heroImagePath ? await (await import("@/lib/storage/service")).getStoragePublicUrl(settings.heroImagePath) : null;

  const featuredPlans = await Promise.all(
    featuredProducts.slice(0, 2).map(async (product) => {
      const price = await getCurrentPriceForProduct(product.id);
      return { product, price };
    })
  );

  const highlights = locale === "vi"
    ? [
        "Gói 30 ngày và trọn đời",
        "Thanh toán PayOS, PayPal, Lemon Squeezy",
        "Giao license key tự động",
        "Hỗ trợ giao diện tiếng Việt / tiếng Anh"
      ]
    : [
        "30-day and lifetime plans",
        "PayOS, PayPal, and Lemon Squeezy ready",
        "Automatic license key delivery",
        "Vietnamese and English UI"
      ];

  return (
    <main className="bg-[radial-gradient(circle_at_top,_#eef4ff,_#ffffff_46%,_#f8fafc_100%)]">
      <section className="mx-auto grid min-h-[calc(100vh-145px)] max-w-7xl gap-14 px-6 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-24">
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-slate-600 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            {getLocalizedText(locale, { vi: "Bán license bản quyền", en: "License store" })}
          </div>

          <div className="space-y-5">
            <p className="text-sm font-medium uppercase tracking-[0.35em] text-blue-600">
              {getLocalizedText(locale, { vi: settings.heroEyebrowVi, en: settings.heroEyebrowEn })}
            </p>
            <h1 className="max-w-2xl text-5xl font-semibold tracking-tight text-slate-950 sm:text-6xl">
              {getLocalizedText(locale, { vi: "Hang Cú video", en: "Hang Cú video" })}
            </h1>
            <p className="max-w-2xl text-2xl font-medium tracking-tight text-slate-900 sm:text-[2rem]">
              {getLocalizedText(locale, { vi: "Mở bán license 30 ngày và trọn đời cho phần mềm video.", en: "Selling 30-day and lifetime licenses for the video software." })}
            </p>
            <p className="max-w-2xl text-lg leading-8 text-slate-600">
              {getLocalizedText(locale, {
                vi: "Trang chủ được tối ưu để khách xem nhanh gói phù hợp, thanh toán gọn và nhận license tự động. Hỗ trợ song ngữ Việt / Anh ngay từ đầu.",
                en: "The homepage is designed to help visitors compare plans quickly, pay smoothly, and receive license keys automatically. Vietnamese and English are supported from day one."
              })}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/products" className="inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800">
              {getLocalizedText(locale, { vi: "Xem gói license", en: "View license plans" })}
            </Link>
            <Link href="/checkout" className="inline-flex rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-900 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50">
              {getLocalizedText(locale, { vi: "Đi tới checkout", en: "Go to checkout" })}
            </Link>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {highlights.map((item) => (
              <div key={item} className="rounded-2xl border border-slate-200 bg-white/85 px-4 py-3 text-sm text-slate-700 shadow-sm">
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-5">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-[0_24px_80px_rgba(15,23,42,0.12)]">
            {heroImageUrl ? (
              <div className="relative aspect-[4/3] overflow-hidden rounded-[1.5rem] bg-slate-100">
                <Image
                  src={heroImageUrl}
                  alt={settings.heroImageAltEn ?? settings.siteNameEn}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 42vw"
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="flex aspect-[4/3] items-center justify-center rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 px-8 text-center">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-700">
                    {locale === "vi" ? "Sản phẩm Hang Cú video" : "Hang Cú video product"}
                  </p>
                  <p className="text-sm text-slate-500">
                    {locale === "vi"
                      ? "Thêm ảnh hero hoặc banner từ Admin > Media để hiển thị đẹp hơn."
                      : "Add a hero image or banner from Admin > Media for a stronger visual."}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {featuredPlans.map(({ product, price }) => (
              <article key={product.id} className={`rounded-[1.75rem] border p-5 shadow-sm transition hover:-translate-y-0.5 ${product.featured ? "border-slate-900 bg-slate-950 text-white" : "border-slate-200 bg-white text-slate-950"}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <p className={`text-xs font-semibold uppercase tracking-[0.25em] ${product.featured ? "text-slate-300" : "text-slate-500"}`}>
                      {product.sku}
                    </p>
                    <h2 className="text-xl font-semibold tracking-tight">{product.name}</h2>
                    <p className={`text-sm leading-6 ${product.featured ? "text-slate-300" : "text-slate-600"}`}>
                      {product.shortDescription}
                    </p>
                  </div>
                  <div className={`rounded-2xl px-3 py-2 text-right ${product.featured ? "bg-white/10" : "bg-slate-50"}`}>
                    <p className="text-xs uppercase tracking-[0.25em] opacity-70">
                      {locale === "vi" ? "Giá từ" : "From"}
                    </p>
                    <p className="mt-1 text-lg font-semibold">
                      {formatMoney(price.amountMinor, price.currency, locale)}
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2 text-xs">
                  <span className={`rounded-full px-3 py-1 ${product.featured ? "bg-white/10 text-slate-100" : "bg-slate-100 text-slate-700"}`}>
                    {product.downloadExpiryDays === 30 ? (locale === "vi" ? "30 ngày" : "30 days") : (locale === "vi" ? "Trọn đời" : "Lifetime")}
                  </span>
                  <span className={`rounded-full px-3 py-1 ${product.featured ? "bg-white/10 text-slate-100" : "bg-slate-100 text-slate-700"}`}>
                    {locale === "vi" ? "Cấp tự động" : "Auto fulfillment"}
                  </span>
                </div>

                <div className="mt-5 flex gap-3">
                  <Link
                    href={`/products/${product.slug}`}
                    className={`inline-flex rounded-full px-4 py-2 text-sm font-medium transition ${product.featured ? "bg-white text-slate-950 hover:bg-slate-100" : "bg-slate-950 text-white hover:bg-slate-800"}`}
                  >
                    {locale === "vi" ? "Xem chi tiết" : "View details"}
                  </Link>
                  <Link
                    href={`/checkout?planCode=${encodeURIComponent(product.sku)}&plan=${encodeURIComponent(product.name)}&amountMinor=${price.amountMinor}&currency=${encodeURIComponent(price.currency)}`}
                    className={`inline-flex rounded-full border px-4 py-2 text-sm font-medium transition ${product.featured ? "border-white/20 text-white hover:bg-white/10" : "border-slate-200 text-slate-900 hover:bg-slate-50"}`}
                  >
                    {locale === "vi" ? "Mua ngay" : "Buy now"}
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
