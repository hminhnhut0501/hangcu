import Link from "next/link";
import Image from "next/image";
import { ChevronRight, Download, Layers3, MoveRight, Sparkles, SplitSquareHorizontal, WandSparkles } from "lucide-react";
import { getStorefrontLocale } from "@/modules/i18n/storefront";
import { getSiteContentSettings } from "@/modules/site-settings/service";
import { listLicensePlans } from "@/modules/license-plans/service";
import { listDonatePackages } from "@/modules/donate-packages/service";
import { MoneyAmount } from "@/components/money/money-amount";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Locale = "vi" | "en";

type FeatureCard = {
  icon: typeof Sparkles;
  title: string;
  text: string;
};

type JsonChip = {
  labelVi: string;
  labelEn: string;
  visible?: boolean;
};

type JsonCard = {
  labelVi: string;
  labelEn: string;
  textVi: string;
  textEn: string;
  visible?: boolean;
};

type JsonStep = {
  stepVi: string;
  stepEn: string;
  visible?: boolean;
};

type JsonHighlight = {
  labelVi: string;
  labelEn: string;
  textVi: string;
  textEn: string;
  visible?: boolean;
};

const legacyHeroPaths = new Set([
  "/brand/hangcu-hero-mockup.png",
  "/brand/hangcu-hero-macbook.png"
]);

function parseJsonArray<T>(value: T[] | null | undefined, fallback: T[]): T[] {
  return Array.isArray(value) ? value : fallback;
}

export default async function HomePage() {
  const locale = (await getStorefrontLocale()) as Locale;
  const settings = await getSiteContentSettings();
  const licensePlans = await listLicensePlans();
  const donatePackages = await listDonatePackages();
  const heroImageSrc = "/brand/hangcu-hero-macbook.png";
  const heroDemoImageSrc = "/brand/hangcu-hero-imac.png";
  const heroChips = parseJsonArray<JsonChip>(settings.heroChips, [
    { labelVi: "Join", labelEn: "Join", visible: true },
    { labelVi: "Cut", labelEn: "Cut", visible: true },
    { labelVi: "Thumb / Face Find", labelEn: "Thumb / Face Find", visible: true },
    { labelVi: "Watermark", labelEn: "Watermark", visible: true },
    { labelVi: "Intro / Outro", labelEn: "Intro / Outro", visible: true },
    { labelVi: "Optimize / Encode", labelEn: "Optimize / Encode", visible: true }
  ]);
  const featureCards = parseJsonArray<JsonCard>(settings.featureCards, [
    {
      labelVi: "Join",
      labelEn: "Join",
      textVi: "Ghép nhiều clip theo đúng thứ tự, có kéo thả để đổi thứ tự.",
      textEn: "Merge clips in order, with drag-and-drop reordering.",
      visible: true
    },
    {
      labelVi: "Cut",
      labelEn: "Cut",
      textVi: "Cắt đầu video hàng loạt để trim nhanh trên nhiều file.",
      textEn: "Trim the head of many videos in one fast batch.",
      visible: true
    },
    {
      labelVi: "Thumb / Face Find",
      labelEn: "Thumb / Face Find",
      textVi: "Xuất thumbnail, contact sheet, chọn frame, chia grid, chỉnh chất lượng.",
      textEn: "Export thumbnails and contact sheets with frame, grid, and quality controls.",
      visible: true
    },
    {
      labelVi: "Watermark",
      labelEn: "Watermark",
      textVi: "Thêm watermark đầy đủ hoặc watermark ẩn cho video.",
      textEn: "Add visible or hidden watermarks to video files.",
      visible: true
    }
  ]);
  const workflowSteps = parseJsonArray<JsonStep>(settings.workflowSteps, [
    { stepVi: "Kéo video vào module", stepEn: "Drag files into a module", visible: true },
    { stepVi: "Chọn preset / grid / chất lượng", stepEn: "Choose preset / grid / quality", visible: true },
    { stepVi: "Bấm xử lý hàng loạt", stepEn: "Run batch processing", visible: true },
    { stepVi: "Xuất file sạch ngay", stepEn: "Export clean output", visible: true }
  ]);
  const planHighlights = parseJsonArray<JsonHighlight>(settings.planHighlights, [
    {
      labelVi: "30 ngày",
      labelEn: "30 days",
      textVi: "Dùng ngắn hạn, test workflow, đổi máy dễ hơn",
      textEn: "Short-term use and workflow testing",
      visible: true
    }
  ]);

  const copy = {
    heroBadge: locale === "vi" ? "Tele video" : "Tele video",
    heroEyebrow: locale === "vi" ? settings.heroEyebrowVi : settings.heroEyebrowEn,
    heroTitle: locale === "vi" ? settings.heroTitleVi : settings.heroTitleEn,
    heroText: locale === "vi" ? settings.heroDescriptionVi : settings.heroDescriptionEn,
    heroSecondaryText: locale === "vi" ? settings.heroSecondaryTextVi : settings.heroSecondaryTextEn,
    primary: locale === "vi" ? settings.heroPrimaryCtaLabelVi : settings.heroPrimaryCtaLabelEn,
    secondary: locale === "vi" ? settings.heroSecondaryCtaLabelVi : settings.heroSecondaryCtaLabelEn,
    appLabel: locale === "vi" ? settings.demoSectionLabelVi : settings.demoSectionLabelEn,
    appCaption: locale === "vi" ? settings.demoSectionDescriptionVi : settings.demoSectionDescriptionEn,
    demoLabel: locale === "vi" ? settings.demoSectionLabelVi : settings.demoSectionLabelEn,
    compareLabel: locale === "vi" ? settings.plansSectionLabelVi : settings.plansSectionLabelEn,
    faqLabel: locale === "vi" ? settings.faqSectionLabelVi : settings.faqSectionLabelEn,
    appCta: locale === "vi" ? "Xem app" : "Open app",
    packagesCta: locale === "vi" ? "Mua license" : "Buy license"
  };

  const features: FeatureCard[] = [
    {
      icon: Layers3,
      title: locale === "vi" ? "Join" : "Join",
      text: locale === "vi" ? "Ghép nhiều clip theo đúng thứ tự, có kéo thả để đổi thứ tự." : "Merge clips in order, with drag-and-drop reordering."
    },
    {
      icon: SplitSquareHorizontal,
      title: locale === "vi" ? "Cut" : "Cut",
      text: locale === "vi" ? "Cắt đầu video hàng loạt để trim nhanh trên nhiều file." : "Trim the head of many videos in one fast batch."
    },
    {
      icon: Sparkles,
      title: locale === "vi" ? "Thumb / Face Find" : "Thumb / Face Find",
      text: locale === "vi" ? "Xuất thumbnail, contact sheet, chọn frame, chia grid, chỉnh chất lượng." : "Export thumbnails and contact sheets with frame, grid, and quality controls."
    },
    {
      icon: WandSparkles,
      title: locale === "vi" ? "Watermark" : "Watermark",
      text: locale === "vi" ? "Thêm watermark đầy đủ hoặc watermark ẩn cho video." : "Add visible or hidden watermarks to video files."
    }
  ];

  const planRows =
    locale === "vi"
      ? [
          { label: "Thanh toán", a: "Một lần", b: "Một lần", c: "Không phải license" },
          { label: "Thời hạn", a: "30 ngày", b: "Trọn đời", c: "Không áp dụng" },
          { label: "Kích hoạt", a: "Một lần", b: "Một lần", c: "Không áp dụng" },
          { label: "Cập nhật", a: "Theo thời hạn", b: "Theo chính sách", c: "Không gồm license" },
          { label: "Thiết bị", a: "1-2 máy", b: "1-2 máy", c: "Không áp dụng" }
        ]
      : [
          { label: "Payment", a: "One-time", b: "One-time", c: "Not a license" },
          { label: "Duration", a: "30 days", b: "Lifetime", c: "N/A" },
          { label: "Activation", a: "One-time", b: "One-time", c: "N/A" },
          { label: "Updates", a: "During term", b: "Per policy", c: "No license benefit" },
          { label: "Devices", a: "1-2 Macs", b: "1-2 Macs", c: "N/A" }
        ];

  const faqs =
    locale === "vi"
      ? [
          {
            q: "Tele video dùng để làm gì?",
            a: "Dùng để xử lý video hàng loạt trên macOS: ghép clip, cắt đầu, xuất thumbnail, watermark, chèn intro / outro và encode."
          },
          {
            q: "License 30 ngày và trọn đời khác nhau thế nào?",
            a: "Bản 30 ngày là license theo thời hạn. Bản trọn đời không hết hạn. Phần ủng hộ là tự do, bạn tự nhập số tiền."
          },
          {
            q: "App có kéo thả không?",
            a: "Có. App thiết kế theo workflow kéo thả để bạn đưa file vào module rất nhanh."
          }
        ]
      : [
          {
            q: "What is Tele video for?",
            a: "It handles batch video workflows on macOS: joining clips, trimming starts, exporting thumbnails, watermarking, intro/outro, and encoding."
          },
          {
            q: "What is the difference between 30-day and lifetime licenses?",
            a: "The 30-day plan is time-limited. The lifetime plan does not expire. Support is flexible, with your own amount."
          },
          {
            q: "Does the app support drag and drop?",
            a: "Yes. The UI is built around drag-and-drop modules for fast workflows."
          }
        ];

  const comparePlans = [
    {
      name: locale === "vi" ? "30 ngày" : "30-day license",
      price: (() => {
        const plan = licensePlans.find((item) => item.code === "HCV_30D" || item.code === "HCV-LIC-30" || item.durationDays === 30 || !item.isLifetime);
        if (!plan) return null;
        const amount = locale === "vi" ? plan.currencyPrices.VND : plan.currencyPrices.USD;
        const currency = locale === "vi" ? "VND" : "USD";
        return { amount, currency };
      })(),
      desc:
        locale === "vi"
          ? "Phù hợp để dùng ngắn hạn hoặc test workflow trước khi mua lâu dài."
          : "Good for short-term use or testing the workflow first."
    },
    {
      name: locale === "vi" ? "Trọn đời" : "Lifetime license",
      price: (() => {
        const plan = licensePlans.find((item) => item.code === "HCV_LIFETIME" || item.code === "HCV-LIC-LIFE" || item.isLifetime);
        if (!plan) return null;
        const amount = locale === "vi" ? plan.currencyPrices.VND : plan.currencyPrices.USD;
        const currency = locale === "vi" ? "VND" : "USD";
        return { amount, currency };
      })(),
      desc:
        locale === "vi"
          ? "Một lần thanh toán, dùng lâu dài."
          : "One-time payment, long-term use."
    }
  ];

  const compareHighlights = planHighlights
    .filter((item) => item.visible !== false)
    .map((item) => ({
      label: locale === "vi" ? item.labelVi : item.labelEn,
      value: locale === "vi" ? item.textVi : item.textEn
    }));

  const supportPackages = donatePackages
    .filter((item) => item.status === "active")
    .map((item) => ({
      slug: item.slug,
      name: item.name,
      description: item.description,
      badge: item.code,
      amount:
        locale === "vi"
          ? item.vndAmountMinor != null
            ? { amount: item.vndAmountMinor, currency: "VND" }
            : "Tùy chọn"
          : item.usdAmountMinor != null
            ? { amount: item.usdAmountMinor, currency: "USD" }
            : "Optional"
    }))
    .slice(0, 3);

  return (
    <main className="overflow-hidden bg-[#f6f8fc] text-slate-950">
      <section id="hero" className="mx-auto grid max-w-7xl gap-12 px-6 pb-16 pt-16 lg:grid-cols-[0.96fr_1.04fr] lg:items-center lg:py-24">
        <div className="animate-fade-up space-y-8 [animation-delay:80ms]">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-md">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            {copy.heroBadge}
          </div>

          <div className="space-y-4">
            <p className="text-sm font-medium text-blue-600">{copy.heroEyebrow}</p>
            <h1 className="max-w-2xl text-5xl font-semibold tracking-tight text-slate-950 sm:text-6xl lg:text-7xl">
              {copy.heroTitle}
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-slate-600">{copy.heroText}</p>
            <p className="max-w-2xl text-sm leading-7 text-slate-500">{copy.heroSecondaryText}</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="#features" className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white shadow-[0_12px_30px_rgba(15,23,42,0.18)] transition duration-300 hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-[0_18px_40px_rgba(15,23,42,0.22)]">
              {copy.primary}
            </Link>
            <Link href="/products" className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-900 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-md">
              {copy.secondary}
              <MoveRight className="h-4 w-4" />
            </Link>
          </div>

        </div>

        <div className="relative animate-fade-up [animation-delay:180ms]">
          <div className="relative mx-auto max-w-[720px] lg:translate-x-2 xl:max-w-[780px]">
            <Image
              src={heroImageSrc}
              alt={locale === "vi" ? "Ảnh app Tele video" : "Tele video app screenshot"}
              width={1600}
              height={1320}
              priority
              className="h-auto w-full scale-[1.02] animate-soft-float"
            />
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-7xl px-6 pb-10">
        <div className="animate-fade-up rounded-[2.25rem] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.06)] [animation-delay:120ms]">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-blue-600">
                {locale === "vi" ? settings.featuresSectionLabelVi : settings.featuresSectionLabelEn}
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight">
                {locale === "vi" ? settings.featuresSectionTitleVi : settings.featuresSectionTitleEn}
              </h2>
            </div>
            <p className="max-w-2xl text-sm leading-7 text-slate-600">
              {locale === "vi" ? settings.featuresSectionDescriptionVi : settings.featuresSectionDescriptionEn}
            </p>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {featureCards.map((item, index) => {
              const Icon = features[index % features.length].icon;
              return (
                <article key={locale === "vi" ? item.labelVi : item.labelEn} className="group rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5 transition duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-white transition duration-300 group-hover:scale-105 group-hover:rotate-[-2deg]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-950">{locale === "vi" ? item.labelVi : item.labelEn}</h3>
                      <p className="mt-2 text-sm leading-6 text-slate-600">{locale === "vi" ? item.textVi : item.textEn}</p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section id="demo" className="mx-auto max-w-7xl px-6 pb-10">
        <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="animate-fade-up overflow-hidden rounded-[2.2rem] border border-slate-200 bg-white shadow-[0_18px_60px_rgba(15,23,42,0.06)] [animation-delay:120ms]">
            <div className="border-b border-slate-200 px-5 py-4">
              <p className="text-sm font-medium text-slate-500">{copy.appLabel}</p>
            </div>
            <div className="bg-[#091221] p-4">
              <Image
                src={heroDemoImageSrc}
                alt={locale === "vi" ? "Ảnh giao diện Tele video" : "Tele video UI screenshot"}
                width={1200}
                height={900}
                className="h-auto w-full rounded-[1.25rem]"
              />
            </div>
            <div className="p-5">
              <p className="text-sm text-slate-600">{copy.appCaption}</p>
            </div>
          </div>

          <div className="grid gap-4">
          <div className="animate-fade-up overflow-hidden rounded-[2.2rem] border border-slate-200 bg-slate-950 shadow-[0_18px_60px_rgba(15,23,42,0.06)] [animation-delay:180ms]">
            <div className="border-b border-white/10 px-5 py-4">
              <p className="text-sm font-medium text-white/60">{copy.demoLabel}</p>
            </div>
              <div className="aspect-[4/3] w-full overflow-hidden bg-black p-4 sm:p-6">
                <video
                  src="/brand/hangcu-demo.mp4"
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  className="h-full w-full object-contain animate-fade-up animate-soft-float [animation-delay:220ms]"
                />
              </div>
            </div>

          <div className="animate-fade-up rounded-[2.2rem] border border-slate-200 bg-white p-5 shadow-[0_18px_60px_rgba(15,23,42,0.06)] [animation-delay:240ms]">
              <p className="text-sm font-medium text-blue-600">
                {locale === "vi" ? settings.demoSectionTitleVi : settings.demoSectionTitleEn}
              </p>
              <div className="mt-4 space-y-3">
                {workflowSteps.map((step, index) => (
                  <div key={locale === "vi" ? step.stepVi : step.stepEn} className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 transition duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-sm">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-950 text-xs font-semibold text-white">
                      {index + 1}
                    </span>
                    <span className="text-sm font-medium text-slate-700">{locale === "vi" ? step.stepVi : step.stepEn}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="plans" className="mx-auto max-w-7xl px-6 pb-10">
        <div className="animate-fade-up rounded-[2.2rem] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.06)] [animation-delay:120ms]">
          <div className="flex items-start justify-between gap-4">
            <div className="max-w-2xl space-y-3">
              <p className="text-sm font-medium text-blue-600">{copy.compareLabel}</p>
              <h2 className="text-2xl font-semibold tracking-tight">
                {locale === "vi" ? settings.plansSectionTitleVi : settings.plansSectionTitleEn}
              </h2>
              <p className="text-sm leading-7 text-slate-600">
                {locale === "vi"
                  ? "Hai gói license chính ở trên cùng, support tách riêng bên dưới, và bảng so sánh ngắn để nhìn là hiểu ngay."
                  : "Two main license plans are shown first, support is kept separate below, and a short comparison makes the differences obvious at a glance."}
              </p>
            </div>
            <Link
              href="/products"
              className="inline-flex h-fit items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-900 transition hover:bg-white"
            >
              {locale === "vi" ? "Xem gói" : "View plans"}
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-7 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            {comparePlans.map((plan, index) => (
              <article
                key={plan.name}
                className={`rounded-[2rem] border p-6 transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_50px_rgba(15,23,42,0.08)] ${
                  index === 0 ? "border-slate-950 bg-slate-950 text-white" : "border-slate-200 bg-white text-slate-950"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-3">
                    <p className={`text-xs font-medium ${index === 0 ? "text-slate-300" : "text-slate-500"}`}>
                      {index === 0 ? (locale === "vi" ? "Đề xuất cho khách mới" : "Best for first-time buyers") : locale === "vi" ? "Dài hạn" : "Long-term"}
                    </p>
                    <h3 className="text-2xl font-semibold">{plan.name}</h3>
                    <p className={`max-w-xl text-sm leading-6 ${index === 0 ? "text-slate-300" : "text-slate-600"}`}>{plan.desc}</p>
                  </div>
                <div className={`rounded-2xl px-4 py-3 text-right ${index === 0 ? "bg-white/10" : "bg-slate-50"}`}>
                    <p className={`text-[11px] ${index === 0 ? "text-slate-300" : "text-slate-500"}`}>{locale === "vi" ? "Từ" : "From"}</p>
                    <p className="mt-1 text-lg font-semibold">
                      {typeof plan.price === "string" ? plan.price : plan.price ? <MoneyAmount amount={plan.price.amount} currency={plan.price.currency} locale={locale} kind="catalog" /> : "-"}
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2 text-xs">
                  <span className={`rounded-full px-3 py-1 ${index === 0 ? "bg-white/10 text-slate-100" : "bg-slate-100 text-slate-700"}`}>
                    {index === 0 ? (locale === "vi" ? "30 ngày" : "30 days") : locale === "vi" ? "Trọn đời" : "Lifetime"}
                  </span>
                  <span className={`rounded-full px-3 py-1 ${index === 0 ? "bg-white/10 text-slate-100" : "bg-slate-100 text-slate-700"}`}>
                    {locale === "vi" ? "Giao tự động" : "Auto delivery"}
                  </span>
                  <span className={`rounded-full px-3 py-1 ${index === 0 ? "bg-white/10 text-slate-100" : "bg-slate-100 text-slate-700"}`}>
                    {locale === "vi" ? "1-2 máy" : "1-2 Macs"}
                  </span>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    href={`/checkout?planCode=${encodeURIComponent(index === 0 ? "HCV-LIC-30" : "HCV-LIC-LIFE")}`}
                    className={`inline-flex rounded-full px-4 py-2 text-sm font-medium ${
                      index === 0 ? "bg-white text-slate-950 hover:bg-slate-100" : "bg-slate-950 text-white hover:bg-slate-800"
                    }`}
                  >
                    {locale === "vi" ? "Mua ngay" : "Buy now"}
                  </Link>
                  <Link
                    href="/products"
                    className={`inline-flex rounded-full px-4 py-2 text-sm font-medium ${
                      index === 0 ? "border border-white/20 text-white hover:bg-white/10" : "border border-slate-200 text-slate-900 hover:bg-slate-50"
                    }`}
                  >
                    {locale === "vi" ? "Chi tiết" : "Details"}
                  </Link>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {compareHighlights.map((item) => (
              <div
                key={item.label}
                className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4 transition hover:border-slate-300 hover:bg-white"
              >
                <p className="text-sm font-medium text-slate-500">{item.label}</p>
                <p className="mt-2 text-sm leading-6 text-slate-700">{item.value}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 overflow-hidden rounded-[1.8rem] border border-slate-200 bg-slate-50">
            <div className="grid gap-0 md:grid-cols-2 xl:grid-cols-3">
              {planRows.map((row) => (
                <div key={row.label} className="border-b border-slate-200 p-4 md:border-b-0 md:border-r md:last:border-r-0">
                  <p className="text-sm font-medium text-slate-500">{row.label}</p>
                  <div className="mt-3 space-y-2 text-sm">
                    <p className="text-slate-700">
                      <span className="font-medium text-slate-950">30D:</span> {row.a}
                    </p>
                    <p className="text-slate-700">
                      <span className="font-medium text-slate-950">Life:</span> {row.b}
                    </p>
                    <p className="text-slate-700">
                      <span className="font-medium text-slate-950">Support:</span> {row.c}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 rounded-[1.8rem] border border-slate-200 bg-white p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-950">
                  {locale === "vi" ? "Ủng hộ tự do" : "Flexible support"}
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  {locale === "vi"
                    ? "Khách tự nhập số tiền, tách riêng khỏi license."
                    : "Customers enter their own amount, separate from licenses."}
                </p>
              </div>
              <Link
                href="/collections"
                className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-900 transition hover:bg-white"
              >
                {locale === "vi" ? "Xem support" : "View support"}
              </Link>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              {supportPackages.map((item) => (
                <article key={item.slug} className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-slate-500">
                        {item.badge ?? (locale === "vi" ? "Support" : "Support")}
                      </p>
                      <h4 className="text-lg font-semibold text-slate-950">{item.name}</h4>
                      <p className="text-sm leading-6 text-slate-600">{item.description}</p>
                    </div>
                    <div className="rounded-2xl bg-white px-3 py-2 text-right ring-1 ring-slate-200">
                      <p className="text-[11px] text-slate-500">{locale === "vi" ? "Từ" : "From"}</p>
                      <p className="mt-1 text-base font-semibold text-slate-950">
                        {typeof item.amount === "string" ? item.amount : <MoneyAmount amount={item.amount.amount} currency={item.amount.currency} locale={locale} />}
                      </p>
                    </div>
                  </div>
                  <Link
                    href={`/checkout?package=${encodeURIComponent(item.slug)}`}
                    className="mt-4 inline-flex rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
                  >
                    {locale === "vi" ? "Ủng hộ" : "Support"}
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="faq" className="mx-auto max-w-7xl px-6 pb-16">
        <div className="animate-fade-up rounded-[2.2rem] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.06)] [animation-delay:120ms]">
          <p className="text-sm font-medium text-blue-600">{copy.faqLabel}</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight">
            {locale === "vi" ? settings.faqSectionTitleVi : settings.faqSectionTitleEn}
          </h2>

          <div className="mt-6 grid gap-4">
            {faqs.map((item) => (
              <details key={item.q} className="group rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5 transition duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_16px_36px_rgba(15,23,42,0.05)]">
                <summary className="cursor-pointer list-none text-base font-semibold text-slate-950">
                  {item.q}
                </summary>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
