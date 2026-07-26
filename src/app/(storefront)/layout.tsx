import Link from "next/link";
import Image from "next/image";
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
  const preferredOrder = ["/products", "/download", "/checkout", "/orders"];
  const utilityNavigation = [
    { href: "/privacy", labelVi: "Privacy", labelEn: "Privacy" },
    { href: "/terms", labelVi: "Terms", labelEn: "Terms" },
    { href: "/refund-policy", labelVi: "Refund", labelEn: "Refund" },
    { href: "/license-agreement", labelVi: "License Agreement", labelEn: "License Agreement" },
    { href: "/faq", labelVi: "FAQ", labelEn: "FAQ" },
    { href: "/contact", labelVi: "Contact", labelEn: "Contact" },
    { href: "/about", labelVi: "About", labelEn: "About" },
    { href: "/pricing", labelVi: "Pricing", labelEn: "Pricing" },
    { href: "/download", labelVi: "Download", labelEn: "Download" }
  ];
  const navigationSource = settings.navigation.some((item) => item.href === "/download")
    ? settings.navigation
    : [
        ...settings.navigation,
        {
          labelVi: "Download",
          labelEn: "Download",
          href: "/download"
        }
      ];
  const visibleNavigation = navigationSource
    .filter((item) => ["/products", "/download", "/checkout", "/orders"].includes(item.href))
    .map((item) => {
      if (item.href === "/products") {
        return { ...item, label: locale === "vi" ? "Các gói bản quyền" : "License plans" };
      }
      if (item.href === "/download") {
        return { ...item, label: locale === "vi" ? "Download" : "Download" };
      }
      if (item.href === "/checkout") {
        return { ...item, label: locale === "vi" ? "Mua" : "Buy" };
      }
      if (item.href === "/orders") {
        return { ...item, label: locale === "vi" ? "Đơn hàng" : "Orders" };
      }
      return { ...item, label: "label" in item ? item.label : item.labelEn };
    })
    .sort((a, b) => {
      const aIndex = preferredOrder.indexOf(a.href);
      const bIndex = preferredOrder.indexOf(b.href);
      const normalizedA = aIndex === -1 ? preferredOrder.length : aIndex;
      const normalizedB = bIndex === -1 ? preferredOrder.length : bIndex;
      return normalizedA - normalizedB;
    });
  const visibleUtilityNavigation = utilityNavigation.map((item) => ({
    ...item,
    label: locale === "vi" ? item.labelVi : item.labelEn
  }));

  return (
    <div className="min-h-screen bg-white text-slate-950">
      <header className="border-b border-slate-200">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-4 lg:flex-row lg:items-center lg:justify-between">
          <Link href="/" className="flex items-center gap-3 text-sm font-semibold">
            <Image
              src="/brand/hangcuvideo-logo.png"
              alt={getLocalizedText(locale, { vi: settings.siteNameVi, en: settings.siteNameEn })}
              width={28}
              height={28}
              className="h-7 w-7 rounded-full"
              priority
            />
            <span>{getLocalizedText(locale, { vi: settings.siteNameVi, en: settings.siteNameEn })}</span>
          </Link>
          <div className="flex flex-col gap-3 lg:items-end">
            <nav className="flex flex-wrap items-center gap-2">
              {visibleNavigation.map((item, index) => (
                <Link
                  key={item.href}
                  href={item.href as any}
                  className={`inline-flex items-center gap-1 rounded-full px-3 py-2 text-sm font-medium transition ${
                    index === 0
                      ? "bg-slate-950 text-white shadow-sm hover:bg-slate-800"
                      : item.href === "/download"
                        ? "border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                  }`}
                >
                  <span>{item.label}</span>
                  {index === 0 ? null : <ChevronRight className={`h-3.5 w-3.5 ${item.href === "/download" ? "opacity-70" : "opacity-50"}`} />}
                </Link>
              ))}
            </nav>
            <div className="flex flex-wrap items-center gap-2">
              {visibleUtilityNavigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href as any}
                  className={`inline-flex items-center rounded-full border px-3 py-2 text-xs font-medium transition ${
                    item.href === "/download"
                      ? "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-950"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              <LanguageSwitcher currentLocale={locale} />
            </div>
          </div>
        </div>
      </header>
      {children}
      <StorefrontFooterLinks />
    </div>
  );
}
