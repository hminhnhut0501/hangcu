import { getProductBySlug } from "@/modules/products/service";
import { getCurrentPriceForProduct } from "@/modules/prices/service";

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

  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          <div className="aspect-[4/5] rounded-2xl bg-slate-100" />
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
              This page will present English and Vietnamese license copy side by
              side as the bilingual content phase lands.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">License price</p>
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
            <h2 className="text-lg font-semibold">License terms</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              License delivery will be handled through license keys. Transitional
              download information remains in the system until the cutover.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
