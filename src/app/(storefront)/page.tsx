import Link from "next/link";
import Image from "next/image";
import { getSiteContentSettings } from "@/modules/site-settings/service";
import { getStoragePublicUrl } from "@/lib/storage/service";

export default async function HomePage() {
  const settings = await getSiteContentSettings();
  const heroImageUrl = settings.heroImagePath ? await getStoragePublicUrl(settings.heroImagePath) : null;
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center px-6 py-24">
      <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <p className="text-sm font-medium uppercase tracking-[0.3em] text-blue-600">
            {settings.heroEyebrowEn}
          </p>
          <h1 className="max-w-3xl text-5xl font-semibold tracking-tight text-slate-950 sm:text-7xl">
            {settings.heroTitleEn}
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-slate-600">
            {settings.heroDescriptionVi}
          </p>
          <p className="max-w-2xl text-base leading-7 text-slate-600">
            {settings.heroSecondaryTextEn}
          </p>
          <div className="flex flex-wrap gap-3 text-sm font-medium">
            <Link
              href={settings.heroPrimaryCtaHref as any}
              className="inline-flex rounded-full bg-slate-950 px-5 py-3 text-white"
            >
              {settings.heroPrimaryCtaLabelEn}
            </Link>
            <Link
              href={settings.heroSecondaryCtaHref as any}
              className="inline-flex rounded-full border border-slate-200 px-5 py-3 text-slate-900"
            >
              {settings.heroSecondaryCtaLabelEn}
            </Link>
          </div>
        </div>
        <div className="flex items-center justify-center">
          {heroImageUrl ? (
            <div className="relative h-[320px] w-full overflow-hidden rounded-3xl shadow-lg sm:h-[420px] lg:h-[520px]">
              <Image
                src={heroImageUrl}
                alt={settings.heroImageAltEn ?? settings.siteNameEn}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 45vw"
                className="object-cover"
              />
            </div>
          ) : (
            <div className="flex min-h-[320px] w-full items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-500">
              Upload a hero image from Admin &gt; Media
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
