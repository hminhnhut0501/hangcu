import Link from "next/link";
import Image from "next/image";
import {
  CheckCircle2,
  Clock3,
  Download,
  Languages,
  ShieldCheck,
  Sparkles,
  Zap
} from "lucide-react";
import { getCurrentPriceForProduct } from "@/modules/prices/service";
import { getSiteContentSettings } from "@/modules/site-settings/service";
import { getStorefrontLocale, getLocalizedText } from "@/modules/i18n/storefront";
import { listFeaturedProducts } from "@/modules/products/service";
import { getStoragePublicUrl } from "@/lib/storage/service";

type Locale = "vi" | "en";

function formatMoney(amountMinor: number, currency: string, locale: Locale) {
  const normalizedCurrency = currency.toUpperCase();
  if (normalizedCurrency === "VND") {
    return locale === "vi"
      ? `${new Intl.NumberFormat("vi-VN").format(amountMinor)}đ`
      : `${new Intl.NumberFormat("en-US").format(amountMinor)} VND`;
  }

  return `${new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amountMinor / 100)} ${normalizedCurrency}`;
}

const featureBlocks = {
  vi: [
    {
      icon: ShieldCheck,
      title: "License sạch",
      text: "Cấp key tự động, có trạng thái, revoke và audit."
    },
    {
      icon: Languages,
      title: "VI / EN",
      text: "Trang chủ và hành trình mua hàng song ngữ."
    },
    {
      icon: Zap,
      title: "Mua nhanh",
      text: "Chọn gói xong là đi thẳng sang checkout."
    },
    {
      icon: Download,
      title: "Giao ngay",
      text: "Sau thanh toán, hệ thống trả license key ngay."
    }
  ],
  en: [
    {
      icon: ShieldCheck,
      title: "Clean licenses",
      text: "Auto-issued keys, status tracking, revoke, and audit."
    },
    {
      icon: Languages,
      title: "VI / EN",
      text: "Bilingual homepage and checkout flow."
    },
    {
      icon: Zap,
      title: "Fast buy",
      text: "Pick a plan and go straight to checkout."
    },
    {
      icon: Download,
      title: "Instant delivery",
      text: "License keys are returned right after payment."
    }
  ]
} as const;

export default async function HomePage() {
  const settings = await getSiteContentSettings();
  const locale = await getStorefrontLocale();
  const featuredProducts = await listFeaturedProducts();
  const heroImageUrl = settings.heroImagePath ? await getStoragePublicUrl(settings.heroImagePath) : null;
  const heroImageSrc = heroImageUrl ?? "/brand/hangcu-hero-mockup.png";
  const featuredPlans = await Promise.all(
    featuredProducts.slice(0, 2).map(async (product) => ({
      product,
      price: await getCurrentPriceForProduct(product.id)
    }))
  );

  const heroCopy = {
    vi: {
      eyebrow: "Bản quyền phần mềm",
      title: "Hang Cú video",
      lead: "Mở bán license 30 ngày và trọn đời.",
      sub: "Gọn, sạch, sang. Dùng cho vài chục đơn mỗi tháng vẫn đủ nhẹ, nhưng đủ chuẩn để scale sau này.",
      primary: "Xem gói license",
      secondary: "Đi tới checkout",
      badge: "Mua nhanh"
    },
    en: {
      eyebrow: "Software licensing",
      title: "Hang Cú video",
      lead: "Selling 30-day and lifetime licenses.",
      sub: "Minimal, refined, and ready for a few dozen orders a month. Built light today, scalable tomorrow.",
      primary: "View license plans",
      secondary: "Go to checkout",
      badge: "Quick buy"
    }
  }[locale];

  const quickBuyLabel = locale === "vi" ? "Chọn gói" : "Choose a plan";
  const featureBlocksForLocale = featureBlocks[locale];
  const trustPoints = locale === "vi"
    ? ["Cấp license tự động", "Tối ưu cho vài chục đơn/tháng", "Giao diện VI / EN"]
    : ["Auto license delivery", "Built for a few dozen orders/month", "VI / EN interface"];

  return (
    <main className="overflow-hidden bg-[#f6f8fc] text-slate-950">
      <section className="relative">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_rgba(96,165,250,0.18),_transparent_40%),radial-gradient(circle_at_top_right,_rgba(16,185,129,0.12),_transparent_30%),linear-gradient(to_bottom,_#f8fbff,_#f6f8fc_55%,_#eef3fb)]" />
        <div className="absolute left-1/2 top-0 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-sky-300/20 blur-3xl motion-safe:animate-[pulse_8s_ease-in-out_infinite]" />

        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-14 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-24">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 shadow-sm backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              {heroCopy.eyebrow}
            </div>

            <div className="space-y-5">
              <p className="text-sm font-medium uppercase tracking-[0.34em] text-blue-600">
                {getLocalizedText(locale, { vi: settings.heroEyebrowVi, en: settings.heroEyebrowEn })}
              </p>
              <h1 className="max-w-2xl text-5xl font-semibold tracking-tight text-slate-950 sm:text-6xl lg:text-7xl">
                {heroCopy.title}
              </h1>
              <p className="max-w-2xl text-2xl font-medium tracking-tight text-slate-900 sm:text-[2rem]">
                {heroCopy.lead}
              </p>
              <p className="max-w-2xl text-lg leading-8 text-slate-600">
                {heroCopy.sub}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white shadow-[0_12px_30px_rgba(15,23,42,0.18)] transition duration-300 hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-[0_18px_40px_rgba(15,23,42,0.22)]"
              >
                {heroCopy.primary}
              </Link>
              <Link
                href="/checkout"
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-900 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50"
              >
                {heroCopy.secondary}
              </Link>
            </div>

            <div className="flex flex-wrap gap-2">
              {trustPoints.map((point) => (
                <span
                  key={point}
                  className="inline-flex items-center rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-xs font-medium text-slate-600 shadow-sm backdrop-blur"
                >
                  {point}
                </span>
              ))}
            </div>

          <div className="grid gap-3 sm:grid-cols-2">
              {featureBlocksForLocale.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    className="group rounded-[1.75rem] border border-white/70 bg-white/85 p-5 shadow-[0_10px_35px_rgba(15,23,42,0.05)] backdrop-blur transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(15,23,42,0.08)] motion-safe:animate-[fadeInUp_700ms_ease-out_both]"
                    style={{ animationDelay: `${index * 120}ms` }}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[1.1rem] bg-slate-950 text-white shadow-sm transition duration-300 group-hover:scale-105 group-hover:rotate-[-2deg]">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-[15px] font-semibold text-slate-950">{item.title}</p>
                        <p className="mt-1 text-sm leading-6 text-slate-600">{item.text}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-blue-500/15 blur-2xl motion-safe:animate-[pulse_10s_ease-in-out_infinite]" />
            <div className="absolute -bottom-10 -left-8 h-32 w-32 rounded-full bg-emerald-400/15 blur-2xl motion-safe:animate-[pulse_12s_ease-in-out_infinite]" />

            <div className="relative rounded-[2.4rem] border border-white/80 bg-white/85 p-4 shadow-[0_30px_100px_rgba(15,23,42,0.12)] backdrop-blur-xl">
              <div className="absolute inset-0 rounded-[2.4rem] bg-[linear-gradient(135deg,rgba(255,255,255,0.92),rgba(255,255,255,0.6))]" />
              <div className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-3">
                <div className="absolute inset-x-0 top-0 h-28 bg-[linear-gradient(180deg,rgba(59,130,246,0.12),transparent)]" />
                <div className="relative overflow-hidden rounded-[1.7rem] bg-slate-950 p-4 text-white shadow-[0_24px_80px_rgba(15,23,42,0.2)]">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(96,165,250,0.22),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.18),transparent_28%)]" />
                  <div className="relative flex items-center justify-between">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.34em] text-slate-300">{heroCopy.badge}</p>
                      <p className="mt-2 text-2xl font-semibold">Hang Cú video</p>
                    </div>
                    <div className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-slate-100">
                      macOS native
                    </div>
                  </div>

                  <div className="mt-4 grid gap-4 md:grid-cols-[1.05fr_0.95fr]">
                    <div className="relative overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/6 p-4">
                      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),transparent_40%)]" />
                      <div className="relative flex h-full min-h-[360px] items-center justify-center rounded-[1.25rem] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_45%),linear-gradient(180deg,rgba(15,23,42,0.65),rgba(15,23,42,0.92))] p-6">
                        <Image
                          src={heroImageSrc}
                          alt="Hang Cú video hero mockup"
                          width={1400}
                          height={900}
                          priority
                          className="h-auto w-full max-w-[520px] drop-shadow-[0_26px_50px_rgba(15,23,42,0.28)] motion-safe:animate-[float_7s_ease-in-out_infinite]"
                        />
                      </div>
                    </div>

                    <div className="grid gap-3">
                      <div className="rounded-[1.35rem] border border-white/10 bg-white/6 p-4">
                        <p className="text-[11px] uppercase tracking-[0.28em] text-slate-300">{locale === "vi" ? "Gói 30 ngày" : "30-day plan"}</p>
                        <div className="mt-2 flex items-end justify-between gap-4">
                          <div>
                            <p className="text-xl font-semibold">{locale === "vi" ? "Bán nhanh" : "Fast sell"}</p>
                            <p className="mt-1 text-sm text-slate-300">{locale === "vi" ? "Phù hợp test thị trường." : "Perfect for market testing."}</p>
                          </div>
                          <div className="rounded-2xl bg-white/10 px-3 py-2 text-right">
                            <p className="text-xs text-slate-300">From</p>
                            <p className="text-lg font-semibold">$9.99</p>
                          </div>
                        </div>
                      </div>
                      <div className="rounded-[1.35rem] border border-white/10 bg-white/6 p-4">
                        <p className="text-[11px] uppercase tracking-[0.28em] text-slate-300">{locale === "vi" ? "Gói trọn đời" : "Lifetime plan"}</p>
                        <div className="mt-2 flex items-end justify-between gap-4">
                          <div>
                            <p className="text-xl font-semibold">{locale === "vi" ? "1 lần mua" : "One-time"}</p>
                            <p className="mt-1 text-sm text-slate-300">{locale === "vi" ? "Dùng lâu dài." : "Long-term use."}</p>
                          </div>
                          <div className="rounded-2xl bg-emerald-400/10 px-3 py-2 text-right">
                            <p className="text-xs text-emerald-200">From</p>
                            <p className="text-lg font-semibold">$29.99</p>
                          </div>
                        </div>
                      </div>
                      <div className="rounded-[1.35rem] border border-emerald-400/20 bg-emerald-400/10 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-[11px] uppercase tracking-[0.28em] text-emerald-200">{locale === "vi" ? "Hệ thống" : "System"}</p>
                            <p className="mt-2 text-xl font-semibold">{locale === "vi" ? "Tự động cấp key" : "Auto-issued key"}</p>
                          </div>
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-400/20 text-emerald-100">
                            <CheckCircle2 className="h-5 w-5" />
                          </div>
                        </div>
                        <div className="mt-4 flex items-center gap-2 text-sm text-slate-200">
                          <Clock3 className="h-4 w-4 text-emerald-200" />
                          <span>{locale === "vi" ? "Giao sau thanh toán vài giây" : "Delivered within seconds after payment"}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-10">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.34em] text-blue-600">
                {quickBuyLabel}
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                {locale === "vi" ? "Chọn gói để đi thẳng sang thanh toán" : "Choose a plan and jump straight to checkout"}
              </h2>
            </div>
            <Link href="/products" className="hidden rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-900 transition hover:bg-white md:inline-flex">
              {locale === "vi" ? "Xem tất cả" : "View all"}
            </Link>
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            {featuredPlans.map(({ product, price }, index) => {
              const isPrimary = index === 0;
              return (
                <article
                  key={product.id}
                  className={`group relative overflow-hidden rounded-[1.75rem] border p-5 transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(15,23,42,0.1)] ${
                    isPrimary ? "border-slate-950 bg-slate-950 text-white" : "border-slate-200 bg-white text-slate-950"
                  }`}
                >
                  <div className={`absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-100 ${isPrimary ? "bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent_35%)]" : "bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.08),transparent_35%)]"}`} />
                  <div className="relative flex items-start justify-between gap-4">
                    <div className="space-y-3">
                      <p className={`text-xs font-semibold uppercase tracking-[0.28em] ${isPrimary ? "text-slate-300" : "text-slate-500"}`}>{product.sku}</p>
                      <h3 className="text-2xl font-semibold tracking-tight">{product.name}</h3>
                      <p className={`max-w-xl text-sm leading-6 ${isPrimary ? "text-slate-300" : "text-slate-600"}`}>{product.shortDescription}</p>
                    </div>
                    <div className={`rounded-2xl px-3 py-2 text-right ${isPrimary ? "bg-white/10" : "bg-slate-50"}`}>
                      <p className={`text-[11px] uppercase tracking-[0.3em] ${isPrimary ? "text-slate-300" : "text-slate-500"}`}>
                        {locale === "vi" ? "Từ" : "From"}
                      </p>
                      <p className="mt-1 text-lg font-semibold">{formatMoney(price.amountMinor, price.currency, locale)}</p>
                    </div>
                  </div>

                  <div className="relative mt-5 flex flex-wrap gap-2 text-xs">
                    <span className={`rounded-full px-3 py-1 ${isPrimary ? "bg-white/10 text-slate-100" : "bg-slate-100 text-slate-700"}`}>
                      {product.downloadExpiryDays === 30 ? (locale === "vi" ? "30 ngày" : "30 days") : (locale === "vi" ? "Trọn đời" : "Lifetime")}
                    </span>
                    <span className={`rounded-full px-3 py-1 ${isPrimary ? "bg-white/10 text-slate-100" : "bg-slate-100 text-slate-700"}`}>
                      {locale === "vi" ? "Cấp tự động" : "Auto fulfillment"}
                    </span>
                    <span className={`rounded-full px-3 py-1 ${isPrimary ? "bg-white/10 text-slate-100" : "bg-slate-100 text-slate-700"}`}>
                      {locale === "vi" ? "Gọn cho vài chục đơn/tháng" : "Built for a few dozen orders/month"}
                    </span>
                  </div>

                  <div className="relative mt-5 flex flex-wrap gap-3">
                    <Link
                      href={`/products/${product.slug}`}
                      className={`inline-flex rounded-full px-4 py-2 text-sm font-medium transition duration-300 ${
                        isPrimary ? "bg-white text-slate-950 hover:bg-slate-100" : "bg-slate-950 text-white hover:bg-slate-800"
                      }`}
                    >
                      {locale === "vi" ? "Xem chi tiết" : "View details"}
                    </Link>
                    <Link
                      href={`/checkout?planCode=${encodeURIComponent(product.sku)}&plan=${encodeURIComponent(product.name)}&amountMinor=${price.amountMinor}&currency=${encodeURIComponent(price.currency)}`}
                      className={`inline-flex rounded-full border px-4 py-2 text-sm font-medium transition duration-300 ${
                        isPrimary ? "border-white/20 text-white hover:bg-white/10" : "border-slate-200 text-slate-900 hover:bg-slate-50"
                      }`}
                    >
                      {locale === "vi" ? "Mua ngay" : "Buy now"}
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-16">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              locale === "vi" ? "License key tự động" : "Auto license key",
              locale === "vi" ? "Cấp quyền / revoke / status" : "Grant / revoke / status",
              locale === "vi" ? "Thanh toán PayOS, PayPal, Lemon Squeezy" : "PayOS, PayPal, Lemon Squeezy",
              locale === "vi" ? "Admin CP tiếng Việt 100%" : "100% Vietnamese admin"
            ].map((item, index) => {
              const Icon = [Sparkles, CheckCircle2, ShieldCheck, Languages][index];
              return (
                <div
                  key={item}
                  className="group rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_10px_40px_rgba(15,23,42,0.05)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_50px_rgba(15,23,42,0.08)]"
                >
                  <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white transition duration-300 group-hover:scale-105 group-hover:rotate-[-2deg]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="text-sm font-semibold leading-6 text-slate-900">{item}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
