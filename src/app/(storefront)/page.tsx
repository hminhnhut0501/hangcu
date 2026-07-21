import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center px-6 py-24">
      <div className="space-y-6">
        <p className="text-sm font-medium uppercase tracking-[0.3em] text-blue-600">
          Hang Cú Video
        </p>
        <h1 className="max-w-3xl text-5xl font-semibold tracking-tight text-slate-950 sm:text-7xl">
          Buy license plans for Hang Cú video.
        </h1>
        <p className="max-w-2xl text-lg leading-8 text-slate-600">
          Mua gói license cho Hang Cú video.
        </p>
        <p className="max-w-2xl text-base leading-7 text-slate-600">
          Choose a 30-day license, a lifetime license, or a donate package that
          includes bonus license keys. The storefront is prepared for English and
          Vietnamese content, with copy-first support in this phase.
        </p>
        <div className="flex flex-wrap gap-3 text-sm font-medium">
          <Link
            href="/products"
            className="inline-flex rounded-full bg-slate-950 px-5 py-3 text-white"
          >
            Browse plans
          </Link>
          <Link
            href="/checkout"
            className="inline-flex rounded-full border border-slate-200 px-5 py-3 text-slate-900"
          >
            Start checkout
          </Link>
        </div>
      </div>
    </main>
  );
}
