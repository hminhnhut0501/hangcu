import Link from "next/link";
import { getCollectionBySlug } from "@/modules/collections/service";
import { listProductsByCollectionSlug } from "@/modules/products/service";
import { getStorefrontLocale } from "@/modules/i18n/storefront";

type CollectionDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function CollectionDetailPage({
  params
}: CollectionDetailPageProps) {
  const { slug } = await params;
  const collection = await getCollectionBySlug(slug);
  const products = await listProductsByCollectionSlug(slug);
  const locale = await getStorefrontLocale();

  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <div className="space-y-3">
        <p className="text-sm font-medium uppercase tracking-[0.3em] text-blue-600">
          {locale === "vi" ? "Nhóm" : "Collection"}
        </p>
        <h1 className="text-4xl font-semibold tracking-tight">{collection.name}</h1>
        <p className="max-w-2xl text-lg leading-8 text-slate-600">
          {collection.description}
        </p>
        <p className="max-w-2xl text-base leading-7 text-slate-600">
          {locale === "vi"
            ? "Đây là khu vực hiển thị các gói license và gói hỗ trợ liên quan."
            : "This area shows related license plans and the support package."}
        </p>
      </div>
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <article
            key={product.id}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="aspect-[4/5] rounded-xl bg-slate-100" />
            <div className="mt-4 space-y-2">
              <p className="text-xs font-medium uppercase tracking-[0.25em] text-slate-500">
                {product.sku}
              </p>
              <h2 className="text-xl font-semibold">{product.name}</h2>
              <p className="text-sm text-slate-600">{product.shortDescription}</p>
              <Link
                className="inline-flex text-sm font-medium text-blue-600"
                href={`/products/${product.slug}`}
              >
                {locale === "vi" ? "Xem chi tiết license" : "View license details"}
              </Link>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
