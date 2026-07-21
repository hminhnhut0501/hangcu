import { SimpleAdminForm } from "@/components/admin/simple-form";
import { getSiteContentSettings } from "@/modules/site-settings/service";

export default async function AdminSiteSettingsPage() {
  const settings = await getSiteContentSettings();

  return (
    <section className="space-y-8">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.3em] text-blue-600">
          Content
        </p>
        <h2 className="mt-3 text-4xl font-semibold tracking-tight">Website content settings</h2>
        <p className="mt-2 max-w-3xl text-sm text-slate-600">
          Quản lý hero, menu, footer, FAQ, announcement và các section toggle cho storefront.
        </p>
      </div>
      <SimpleAdminForm
        endpoint="/api/admin/site-settings"
        submitLabel="Save content"
        onSuccessMessage="Website content updated."
        fields={[
          { name: "siteNameVi", label: "Site name VI", defaultValue: settings.siteNameVi },
          { name: "siteNameEn", label: "Site name EN", defaultValue: settings.siteNameEn },
          { name: "heroEyebrowVi", label: "Hero eyebrow VI", defaultValue: settings.heroEyebrowVi },
          { name: "heroEyebrowEn", label: "Hero eyebrow EN", defaultValue: settings.heroEyebrowEn },
          { name: "heroTitleVi", label: "Hero title VI", defaultValue: settings.heroTitleVi },
          { name: "heroTitleEn", label: "Hero title EN", defaultValue: settings.heroTitleEn },
          { name: "heroDescriptionVi", label: "Hero description VI", defaultValue: settings.heroDescriptionVi },
          { name: "heroDescriptionEn", label: "Hero description EN", defaultValue: settings.heroDescriptionEn },
          { name: "heroSecondaryTextVi", label: "Hero secondary VI", defaultValue: settings.heroSecondaryTextVi },
          { name: "heroSecondaryTextEn", label: "Hero secondary EN", defaultValue: settings.heroSecondaryTextEn },
          { name: "heroPrimaryCtaLabelVi", label: "Primary CTA VI", defaultValue: settings.heroPrimaryCtaLabelVi },
          { name: "heroPrimaryCtaLabelEn", label: "Primary CTA EN", defaultValue: settings.heroPrimaryCtaLabelEn },
          { name: "heroPrimaryCtaHref", label: "Primary CTA href", defaultValue: settings.heroPrimaryCtaHref },
          { name: "heroSecondaryCtaLabelVi", label: "Secondary CTA VI", defaultValue: settings.heroSecondaryCtaLabelVi },
          { name: "heroSecondaryCtaLabelEn", label: "Secondary CTA EN", defaultValue: settings.heroSecondaryCtaLabelEn },
          { name: "heroSecondaryCtaHref", label: "Secondary CTA href", defaultValue: settings.heroSecondaryCtaHref },
          { name: "announcementTextVi", label: "Announcement VI", defaultValue: settings.announcementTextVi },
          { name: "announcementTextEn", label: "Announcement EN", defaultValue: settings.announcementTextEn },
          { name: "announcementVisible", label: "Show announcement", type: "checkbox", defaultValue: String(settings.announcementVisible) },
          { name: "showFeaturedPlansSection", label: "Show featured plans", type: "checkbox", defaultValue: String(settings.showFeaturedPlansSection) },
          { name: "showDonateSection", label: "Show donate section", type: "checkbox", defaultValue: String(settings.showDonateSection) },
          { name: "showFaqSection", label: "Show FAQ section", type: "checkbox", defaultValue: String(settings.showFaqSection) },
          { name: "navigation", label: "Navigation JSON", type: "textarea", rows: 6, defaultValue: JSON.stringify(settings.navigation, null, 2) },
          { name: "footerNoteVi", label: "Footer note VI", defaultValue: settings.footerNoteVi },
          { name: "footerNoteEn", label: "Footer note EN", defaultValue: settings.footerNoteEn },
          { name: "faqItems", label: "FAQ JSON", type: "textarea", rows: 8, defaultValue: JSON.stringify(settings.faqItems, null, 2) }
        ]}
      />
    </section>
  );
}
