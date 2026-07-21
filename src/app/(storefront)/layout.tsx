import Link from "next/link";
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
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-sm font-semibold tracking-wide">
            {getLocalizedText(locale, { vi: settings.siteNameVi, en: settings.siteNameEn })}
          </Link>
          <div className="flex items-center gap-4">
            <nav className="hidden items-center gap-6 text-sm text-slate-600 md:flex">
              {settings.navigation.filter((item) => item.visible).map((item) => (
                <Link key={item.href} href={item.href as any}>
                  {item.label}
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
