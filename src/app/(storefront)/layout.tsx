import { getSiteContentSettings } from "@/modules/site-settings/service";
import { getStorefrontLocale, getLocalizedText } from "@/modules/i18n/storefront";
import { StorefrontHeader } from "@/components/storefront/storefront-header";
import { StorefrontFooterLinks } from "@/components/storefront/footer-links";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function StorefrontLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSiteContentSettings();
  const locale = await getStorefrontLocale();
  const siteName = getLocalizedText(locale, { vi: settings.siteNameVi, en: settings.siteNameEn });

  return (
    <div className="min-h-screen bg-white text-slate-950">
      <StorefrontHeader
        siteName={siteName}
        logoAlt={siteName}
        locale={locale}
        items={[
          { href: "/products", label: locale === "vi" ? "Các gói bản quyền" : "License plans" },
          { href: "/download", label: locale === "vi" ? "Download" : "Download" },
          { href: "/checkout", label: locale === "vi" ? "Mua" : "Buy" },
          { href: "/orders", label: locale === "vi" ? "Đơn hàng" : "Orders" }
        ]}
      />
      {children}
      <StorefrontFooterLinks />
    </div>
  );
}
