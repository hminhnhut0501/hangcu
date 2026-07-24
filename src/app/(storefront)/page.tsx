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
      title: "Cấp key tự động",
      text: "Hệ thống tự cấp, theo dõi trạng thái và ghi nhận lịch sử xử lý."
    },
    {
      icon: Languages,
      title: "VI / EN",
      text: "Giao diện song ngữ cho trang chủ, mua hàng và thanh toán."
    },
    {
      icon: Zap,
      title: "Mua nhanh",
      text: "Chọn gói rồi đi thẳng sang checkout, không cần qua nhiều bước."
    },
    {
      icon: Download,
      title: "Giao ngay",
      text: "Thanh toán xong là nhận license key qua email hoặc bot."
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
      eyebrow: "License phần mềm",
      title: "Hang Cú video",
      lead: "Mở bán license 30 ngày và trọn đời.",
      sub: "Gọn, rõ ràng và dễ dùng. Phù hợp cho cửa hàng nhỏ nhưng vẫn đủ đường để mở rộng sau này.",
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
  const featureMenu = locale === "vi"
    ? [
        { label: "Giới thiệu", href: "#hero" },
        { label: "Tính năng", href: "#features" },
        { label: "Ảnh app", href: "#showcase" },
        { label: "Chọn gói", href: "#plans" },
        { label: "So sánh", href: "#compare" }
      ]
    : [
        { label: "Intro", href: "#hero" },
        { label: "Features", href: "#features" },
        { label: "App shots", href: "#showcase" },
        { label: "Plans", href: "#plans" },
        { label: "Compare", href: "#compare" }
      ];
  const trustPoints = locale === "vi"
    ? ["Giao key tự động", "Phù hợp lượng đơn nhỏ", "Giao diện VI / EN"]
    : ["Auto license delivery", "Built for a few dozen orders/month", "VI / EN interface"];
  const comparisonRows = [
    {
      label: locale === "vi" ? "Thanh toán" : "Payment",
      a: locale === "vi" ? "Một lần" : "One-time",
      b: locale === "vi" ? "Một lần" : "One-time",
      c: locale === "vi" ? "Tự nguyện" : "Optional support"
    },
    {
      label: locale === "vi" ? "Thời hạn" : "Duration",
      a: locale === "vi" ? "30 ngày từ lúc kích hoạt" : "30 days after activation",
      b: locale === "vi" ? "Không hết hạn" : "No expiry",
      c: locale === "vi" ? "Không phải license" : "Not a license"
    },
    {
      label: locale === "vi" ? "Tự động gia hạn" : "Auto-renew",
      a: locale === "vi" ? "Không" : "No",
      b: locale === "vi" ? "Không" : "No",
      c: locale === "vi" ? "Không" : "No"
    },
    {
      label: locale === "vi" ? "Số thiết bị" : "Devices",
      a: "1-2",
      b: "1-2",
      c: locale === "vi" ? "Không áp dụng" : "N/A"
    },
    {
      label: locale === "vi" ? "Cập nhật" : "Updates",
      a: locale === "vi" ? "Trong thời hạn license" : "While active",
      b: locale === "vi" ? "Theo chính sách công bố" : "Per published policy",
      c: locale === "vi" ? "Không có quyền lợi license" : "No license benefit"
    }
  ];
  const featureBadges = locale === "vi"
    ? ["Tự động cấp key", "VI / EN"]
    : ["Auto key delivery", "VI / EN"];
  const highlightRows = locale === "vi"
    ? [
        { title: "Mua xong dùng ngay", text: "Quy trình gọn: chọn gói, nhập email, chọn cổng, thanh toán." },
        { title: "Giao diện song ngữ", text: "Khách và chủ shop đều dùng được tiếng Việt hoặc tiếng Anh." },
        { title: "Phù hợp shop nhỏ", text: "Tối ưu cho vài chục đơn mỗi tháng nhưng vẫn dễ mở rộng." }
      ]
    : [
        { title: "Buy and use right away", text: "Choose a plan, enter email, select gateway, and pay." },
        { title: "Bilingual interface", text: "Customers and merchants can use Vietnamese or English." },
        { title: "Built for small volume", text: "Smooth for a few dozen orders a month and easy to scale." }
      ];

  return (
    <main className="overflow-hidden bg-[#f6f8fc] text-slate-950">
      <section id="hero" className="relative">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_rgba(96,165,250,0.18),_transparent_40%),radial-gradient(circle_at_top_right,_rgba(16,185,129,0.12),_transparent_30%),linear-gradient(to_bottom,_#f8fbff,_#f6f8fc_55%,_#eef3fb)]" />
        <div className="absolute left-1/2 top-0 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-sky-300/20 blur-3xl motion-safe:animate-[pulse_8s_ease-in-out_infinite]" />

        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 lg:grid-cols-[0.94fr_1.06fr] lg:items-center lg:py-24">
          <div className="space-y-8">
            <div className="flex flex-wrap gap-2">
              {featureMenu.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:text-slate-950"
                >
                  {item.label}
                </a>
              ))}
            </div>

            <div className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/80 px-4 py-2 text-xs font-semibold text-slate-500 shadow-sm backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              {heroCopy.eyebrow}
            </div>

            <div className="space-y-4">
              <p className="text-sm font-medium text-blue-600">
                {getLocalizedText(locale, { vi: settings.heroEyebrowVi, en: settings.heroEyebrowEn })}
              </p>
              <h1 className="max-w-2xl text-5xl font-semibold tracking-tight text-slate-950 sm:text-6xl lg:text-7xl">
                {heroCopy.title}
              </h1>
              <p className="max-w-2xl text-2xl font-medium leading-tight text-slate-900 sm:text-[2rem]">
                {heroCopy.lead}
              </p>
              <p className="max-w-xl text-lg leading-8 text-slate-600">
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
              {featureBadges.map((point) => (
                <span
                  key={point}
                  className="inline-flex items-center rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-xs font-medium text-slate-600 shadow-sm backdrop-blur"
                >
                  {point}
                </span>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -right-8 -top-10 h-32 w-32 rounded-full bg-blue-500/15 blur-3xl motion-safe:animate-[pulse_10s_ease-in-out_infinite]" />
            <div className="absolute -bottom-12 left-6 h-36 w-36 rounded-full bg-emerald-400/12 blur-3xl motion-safe:animate-[pulse_12s_ease-in-out_infinite]" />

            <div className="relative mx-auto max-w-[620px]">
              <div className="absolute -inset-6 rounded-[3rem] bg-white/40 blur-2xl" />
              <div className="relative overflow-hidden rounded-[2.75rem] border border-white/70 bg-white/80 p-3 shadow-[0_30px_90px_rgba(15,23,42,0.12)] backdrop-blur-xl">
                <div className="absolute inset-x-8 top-8 h-px bg-white/70" />
                <div className="absolute inset-x-0 bottom-0 h-32 bg-[linear-gradient(180deg,rgba(255,255,255,0),rgba(255,255,255,0.9))]" />
                <div className="relative overflow-hidden rounded-[2.2rem] border border-slate-200 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.12),_transparent_45%),linear-gradient(180deg,#fbfcff,#eef4ff)]">
                  <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.65),transparent_38%)]" />
                  <div className="absolute left-6 top-6 inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/85 px-3 py-1.5 text-[11px] font-semibold text-slate-500 shadow-sm">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    {heroCopy.badge}
                  </div>
                  <div className="absolute right-6 top-6 rounded-full border border-white/80 bg-white/85 px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm">
                    macOS native
                  </div>
                  <div className="absolute left-6 bottom-6 rounded-[1.5rem] border border-white/80 bg-white/85 px-4 py-3 shadow-sm backdrop-blur">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                      {locale === "vi" ? "Mua nhanh" : "Quick buy"}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      {locale === "vi" ? "Chọn gói, nhập email, thanh toán." : "Pick a plan, enter email, pay."}
                    </p>
                  </div>
                  <div className="absolute right-6 bottom-6 rounded-[1.5rem] border border-slate-200 bg-white/90 px-4 py-3 shadow-sm">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                      {locale === "vi" ? "Tình trạng" : "Status"}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      {locale === "vi" ? "Giao key tự động" : "Auto delivery"}
                    </p>
                  </div>
                  <div className="relative flex min-h-[640px] items-center justify-center p-6 sm:p-8">
                    <div className="absolute left-10 top-20 h-24 w-24 rounded-full bg-sky-400/20 blur-2xl" />
                    <div className="absolute right-12 top-32 h-32 w-32 rounded-full bg-emerald-400/15 blur-2xl" />
                    <Image
                      src={heroImageSrc}
                      alt="Hang Cú video app preview"
                      width={1400}
                      height={1200}
                      priority
                      className="h-auto w-full max-w-[540px] drop-shadow-[0_32px_60px_rgba(15,23,42,0.18)] motion-safe:animate-[float_8s_ease-in-out_infinite]"
                    />
                    <div className="pointer-events-none absolute inset-0 rounded-[2rem] ring-1 ring-white/30" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-7xl px-6 pb-10 pt-6">
        <div className="rounded-[2.25rem] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blue-600">
                {locale === "vi" ? "Tính năng chính" : "Core benefits"}
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight">
                {locale === "vi" ? "Tối giản nhưng vẫn đủ thuyết phục" : "Minimal, but still convincing"}
              </h2>
            </div>
            <p className="max-w-2xl text-sm leading-7 text-slate-600">
              {locale === "vi"
                ? "Khối này chỉ giữ những gì giúp khách ra quyết định: app thật, video thật, và ba lợi ích rõ ràng."
                : "This section keeps only what helps customers decide: real app, real video, and three clear benefits."}
            </p>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {highlightRows.map((item, index) => {
              const Icon = [ShieldCheck, Languages, Zap][index];
              return (
                <div key={item.title} className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5">
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-white">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-950">{item.title}</p>
                      <p className="mt-1 text-sm leading-6 text-slate-600">{item.text}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div id="showcase" className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white">
              <div className="border-b border-slate-200 px-5 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
                  {locale === "vi" ? "Ảnh app thật" : "Real app shot"}
                </p>
              </div>
              <div className="bg-[#091221] p-4">
                <Image
                  src="/brand/hangcu-hero-mockup.png"
                  alt={locale === "vi" ? "Ảnh chụp ứng dụng Hang Cú video" : "Hang Cú video app screenshot"}
                  width={1200}
                  height={900}
                  className="h-auto w-full rounded-[1.25rem]"
                />
              </div>
            </div>

            <div className="grid gap-4">
              <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-950">
                <div className="border-b border-white/10 px-5 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/60">
                    {locale === "vi" ? "Video demo" : "Demo video"}
                  </p>
                </div>
                <video
                  src="/brand/hangcu-demo.mp4"
                  controls
                  playsInline
                  className="aspect-[4/3] w-full object-cover"
                />
              </div>

              <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
                  {locale === "vi" ? "Luồng mua" : "Purchase flow"}
                </p>
                <div className="mt-4 space-y-3">
                  {[
                    locale === "vi" ? "Chọn gói" : "Pick a plan",
                    locale === "vi" ? "Nhập email" : "Enter email",
                    locale === "vi" ? "Chọn cổng thanh toán" : "Choose gateway",
                    locale === "vi" ? "Thanh toán" : "Pay"
                  ].map((step, index) => (
                    <div key={step} className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-950 text-xs font-semibold text-white">
                        {index + 1}
                      </span>
                      <span className="text-sm font-medium text-slate-700">{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="plans" className="mx-auto max-w-7xl px-6 pb-10">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blue-600">
                {quickBuyLabel}
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight">
                {locale === "vi" ? "Chọn gói rồi đi thẳng sang thanh toán" : "Pick a plan and jump straight to checkout"}
              </h2>
            </div>
            <Link href="/products" className="hidden rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-900 transition hover:bg-white md:inline-flex">
              {locale === "vi" ? "Xem tất cả" : "View all"}
            </Link>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {featuredPlans.map(({ product, price }, index) => {
              const isPrimary = index === 0;
              return (
                <article
                  key={product.id}
                  className={`group relative overflow-hidden rounded-[1.9rem] border p-6 transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(15,23,42,0.1)] ${
                    isPrimary ? "border-slate-950 bg-slate-950 text-white" : "border-slate-200 bg-white text-slate-950"
                  }`}
                >
                  <div className={`absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-100 ${isPrimary ? "bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent_35%)]" : "bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.08),transparent_35%)]"}`} />
                  <div className="relative flex items-start justify-between gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <p className={`text-xs font-semibold ${isPrimary ? "text-slate-300" : "text-slate-500"}`}>{product.sku}</p>
                        {index === 0 ? (
                          <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] ${isPrimary ? "bg-white/10 text-white" : "bg-slate-100 text-slate-700"}`}>
                            {locale === "vi" ? "Nổi bật" : "Featured"}
                          </span>
                        ) : null}
                      </div>
                      <h3 className="text-2xl font-semibold tracking-tight">{product.name}</h3>
                      <p className={`max-w-xl text-sm leading-6 ${isPrimary ? "text-slate-300" : "text-slate-600"}`}>{product.shortDescription}</p>
                    </div>
                    <div className={`rounded-2xl px-3 py-2 text-right ${isPrimary ? "bg-white/10" : "bg-slate-50"}`}>
                      <p className={`text-[11px] ${isPrimary ? "text-slate-300" : "text-slate-500"}`}>
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

                  <div className="relative mt-5 grid gap-2 text-xs">
                    <div className={`flex items-center justify-between rounded-2xl px-4 py-3 ${isPrimary ? "bg-white/10 text-slate-100" : "bg-slate-50 text-slate-700"}`}>
                      <span>{locale === "vi" ? "Tối ưu cho" : "Best for"}</span>
                      <span className="font-medium">{locale === "vi" ? "mua nhanh" : "fast buyers"}</span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {comparisonRows.map((row) => (
              <div key={row.label} className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">{row.label}</p>
                <div className="mt-3 space-y-2 text-sm">
                  <p className="text-slate-700"><span className="font-medium text-slate-950">30D:</span> {row.a}</p>
                  <p className="text-slate-700"><span className="font-medium text-slate-950">Life:</span> {row.b}</p>
                  <p className="text-slate-700"><span className="font-medium text-slate-950">Support:</span> {row.c}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="compare" className="mx-auto max-w-7xl px-6 pb-16">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            locale === "vi" ? "Tự động cấp key" : "Auto-issued license keys",
            locale === "vi" ? "Quản lý trạng thái" : "Status management",
            locale === "vi" ? "Thanh toán linh hoạt" : "Flexible payments",
            locale === "vi" ? "Admin gọn, dễ thao tác" : "Clean admin workflow"
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
