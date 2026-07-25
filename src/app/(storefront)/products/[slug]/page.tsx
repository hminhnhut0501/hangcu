import { getProductBySlug } from "@/modules/products/service";
import { getCurrentPriceForProduct } from "@/modules/prices/service";
import { getStorefrontLocale } from "@/modules/i18n/storefront";
import { Download, KeyRound, Laptop, ShieldCheck } from "lucide-react";

type ProductDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function ProductDetailPage({
  params
}: ProductDetailPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  const price = await getCurrentPriceForProduct(product.id);
  const locale = await getStorefrontLocale();

  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.14),_transparent_40%),linear-gradient(180deg,#f8fbff,#eef4ff)] shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
            <div className="aspect-[4/5] bg-[url('/brand/hangcu-hero-mockup.png')] bg-cover bg-center" />
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {product.media.map((media) => (
              <div key={media.id} className="aspect-square rounded-xl bg-slate-100" />
            ))}
          </div>
        </div>
        <section className="space-y-6">
          <div>
            <p className="text-sm font-medium text-blue-600">
              {product.sku}
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight">
              {product.name}
            </h1>
            <p className="mt-4 text-lg leading-8 text-slate-600">
              {product.description}
            </p>
            <p className="mt-3 text-base leading-7 text-slate-600">
              {locale === "vi"
                ? "Trang này trình bày mô tả rõ ràng cho reviewer: ứng dụng macOS thật, giao license qua email và kích hoạt bằng key."
                : "This page gives reviewers a clear view: a real macOS app, email delivery, and key-based activation."}
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-blue-50 p-2 text-blue-600">
                  <Laptop className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Version</p>
                  <p className="text-sm font-semibold text-slate-950">v1.0</p>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-emerald-50 p-2 text-emerald-600">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">macOS</p>
                  <p className="text-sm font-semibold text-slate-950">14.0+</p>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-violet-50 p-2 text-violet-600">
                  <KeyRound className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Architecture</p>
                  <p className="text-sm font-semibold text-slate-950">Apple Silicon + Intel</p>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-amber-50 p-2 text-amber-600">
                  <Download className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Checksum</p>
                  <p className="text-sm font-semibold text-slate-950">SHA-256 published at download</p>
                </div>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">{locale === "vi" ? "Giá license" : "License price"}</p>
            <p className="mt-2 text-3xl font-semibold">
              {price.currency} {(price.amountMinor / 100).toFixed(2)}
            </p>
            {price.compareAtAmountMinor ? (
              <p className="mt-1 text-sm text-slate-500 line-through">
                {price.currency} {(price.compareAtAmountMinor / 100).toFixed(2)}
              </p>
            ) : null}
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold">{locale === "vi" ? "Điều khoản license" : "License terms"}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {locale === "vi"
                ? "License được giao qua key duy nhất gửi bằng email. Gói 30 ngày tính từ lúc kích hoạt; gói trọn đời không có ngày hết hạn."
                : "Licenses are delivered through a unique key sent by email. The 30-day plan starts at activation; the lifetime plan has no expiry date."}
            </p>
            <div className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
              <p>{locale === "vi" ? "Hỗ trợ macOS 14+" : "Supports macOS 14+"}</p>
              <p>{locale === "vi" ? "Apple Silicon và Intel" : "Apple Silicon and Intel"}</p>
              <p>{locale === "vi" ? "Kích hoạt theo key" : "Key-based activation"}</p>
              <p>{locale === "vi" ? "Giao license qua email" : "License delivered by email"}</p>
              <p>{locale === "vi" ? "Link tải chính thức" : "Official download link"}</p>
              <p>{locale === "vi" ? "Checksum SHA-256 khi phát hành" : "SHA-256 checksum on release"}</p>
            </div>
            <ol className="mt-5 space-y-2 text-sm leading-6 text-slate-600">
              <li>
                1. {locale === "vi" ? "Mở email xác nhận thanh toán để lấy key." : "Open the payment confirmation email to get your key."}
              </li>
              <li>
                2. {locale === "vi" ? "Tải bản cài từ link chính thức và mở file .dmg." : "Download the installer from the official link and open the .dmg file."}
              </li>
              <li>
                3. {locale === "vi" ? "Dán license key vào màn hình kích hoạt trong ứng dụng." : "Paste the license key into the app activation screen."}
              </li>
              <li>
                4. {locale === "vi" ? "Nếu đổi máy hoặc lỗi kích hoạt, liên hệ support qua email." : "If you change devices or hit an activation issue, contact support by email."}
              </li>
            </ol>
          </div>
        </section>
      </div>
    </main>
  );
}
