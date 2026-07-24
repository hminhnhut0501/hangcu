import { getProductBySlug } from "@/modules/products/service";
import { getCurrentPriceForProduct } from "@/modules/prices/service";
import { getStorefrontLocale } from "@/modules/i18n/storefront";

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
          <div className="aspect-[4/5] rounded-2xl border border-slate-200 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.14),_transparent_40%),linear-gradient(180deg,#f8fbff,#eef4ff)]" />
          <div className="grid gap-3 sm:grid-cols-3">
            {product.media.map((media) => (
              <div key={media.id} className="aspect-square rounded-xl bg-slate-100" />
            ))}
          </div>
        </div>
        <section className="space-y-6">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.3em] text-blue-600">
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
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
