import Link from "next/link";
import { listCollections } from "@/modules/collections/service";

export default async function CollectionsPage() {
  const collections = await listCollections();

  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <div className="space-y-3">
        <p className="text-sm font-medium uppercase tracking-[0.3em] text-blue-600">
          Collections
        </p>
        <h1 className="text-4xl font-semibold tracking-tight">License collections</h1>
        <p className="max-w-2xl text-base leading-7 text-slate-600">
          Nhóm các gói license theo series sản phẩm và các gói donate.
        </p>
      </div>
      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {collections.map((collection) => (
          <article
            key={collection.id}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <p className="text-sm text-slate-500">{collection.slug}</p>
            <h2 className="mt-2 text-xl font-semibold">{collection.name}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {collection.description}
            </p>
            <Link
              href={`/collections/${collection.slug}`}
              className="mt-4 inline-flex text-sm font-medium text-blue-600"
            >
              Browse collection
            </Link>
          </article>
        ))}
      </div>
    </main>
  );
}
