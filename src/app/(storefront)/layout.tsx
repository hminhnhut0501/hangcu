import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { getSiteContentSettings } from "@/modules/site-settings/service";
import { getStorefrontLocale, getLocalizedText } from "@/modules/i18n/storefront";
import { LanguageSwitcher } from "@/components/storefront/language-switcher";
import { StorefrontFooterLinks } from "@/components/storefront/footer-links";

export default async function StorefrontLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSiteContentSettings();
  const locale = await getStorefrontLocale();

  return (
    <div className="min-h-screen bg-white text-slate-950">
      <header className="border-b border-slate-200">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <Link href="/" className="text-sm font-semibold tracking-wide">
            {getLocalizedText(locale, { vi: settings.siteNameVi, en: settings.siteNameEn })}
          </Link>
          <div className="flex items-center gap-3">
            <nav className="hidden items-center gap-2 md:flex">
              {settings.navigation.filter((item) => item.visible).map((item, index) => (
                <Link
                  key={item.href}
                  href={item.href as any}
                  className={`inline-flex items-center gap-1 rounded-full px-3 py-2 text-sm font-medium transition ${
                    index === 0
                      ? "bg-slate-950 text-white shadow-sm hover:bg-slate-800"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                  }`}
                >
                  <span>{item.label}</span>
                  {index === 0 ? null : <ChevronRight className="h-3.5 w-3.5 opacity-50" />}
                </Link>
              ))}
            </nav>
            <LanguageSwitcher currentLocale={locale} />
          </div>
        </div>
      </header>
      {children}
      <StorefrontFooterLinks />
    </div>
  );
}
