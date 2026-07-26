import { SimpleAdminForm } from "@/components/admin/simple-form";
import { getSiteContentSettingsWithSource } from "@/modules/site-settings/service";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminSiteSettingsPage({
}: {
}) {
  let settings: Awaited<ReturnType<typeof getSiteContentSettingsWithSource>>["settings"] | null = null;
  let source: Awaited<ReturnType<typeof getSiteContentSettingsWithSource>>["source"] | null = null;
  let errorMessage: string | null = null;

  try {
    const result = await getSiteContentSettingsWithSource();
    settings = result.settings;
    source = result.source;
  } catch (error) {
    errorMessage = error instanceof Error ? error.message : "SITE_SETTINGS_DB_ERROR: Không thể tải site_settings.";
  }

  const heroChips = settings ? JSON.stringify(settings.heroChips, null, 2) : "[]";
  const featureCards = settings ? JSON.stringify(settings.featureCards, null, 2) : "[]";
  const workflowSteps = settings ? JSON.stringify(settings.workflowSteps, null, 2) : "[]";
  const planHighlights = settings ? JSON.stringify(settings.planHighlights, null, 2) : "[]";
  return (
    <section className="space-y-8">
      <div>
        <p className="text-sm font-medium text-blue-600">
          Nội dung
        </p>
        <h2 className="mt-3 text-4xl font-semibold tracking-tight">Cài đặt nội dung website</h2>
        <p className="mt-2 max-w-3xl text-sm text-slate-600">
          Một màn để chỉnh toàn bộ nội dung homepage, không cần mở nhiều section.
        </p>
        <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm">
          <span className={`h-2 w-2 rounded-full ${errorMessage ? "bg-rose-500" : source === "fallback" ? "bg-amber-500" : "bg-emerald-500"}`} />
          {errorMessage
            ? "site_settings: lỗi DB"
            : source === "fallback"
              ? "site_settings: fallback memory"
              : "site_settings: đọc từ Supabase"}
        </div>
      </div>
      <div className="grid gap-6 xl:grid-cols-[1fr_0.72fr]">
        {settings ? (
          <SimpleAdminForm
            endpoint="/api/admin/site-settings"
            submitLabel="Lưu nội dung"
            onSuccessMessage="Đã cập nhật nội dung website."
            sections={[
              {
                title: "Nội dung homepage",
                description: "Chỉnh toàn bộ chữ đang hiển thị trên homepage trong một form.",
                fields: [
                  { name: "siteNameVi", label: "Tên site VI", defaultValue: settings.siteNameVi },
                  { name: "siteNameEn", label: "Tên site EN", defaultValue: settings.siteNameEn },
                  { name: "heroEyebrowVi", label: "Dòng phụ VI", defaultValue: settings.heroEyebrowVi },
                  { name: "heroEyebrowEn", label: "Dòng phụ EN", defaultValue: settings.heroEyebrowEn },
                  { name: "heroTitleVi", label: "Tiêu đề VI", defaultValue: settings.heroTitleVi },
                  { name: "heroTitleEn", label: "Tiêu đề EN", defaultValue: settings.heroTitleEn },
                  { name: "heroDescriptionVi", label: "Mô tả VI", defaultValue: settings.heroDescriptionVi, type: "textarea", rows: 3 },
                  { name: "heroDescriptionEn", label: "Mô tả EN", defaultValue: settings.heroDescriptionEn, type: "textarea", rows: 3 },
                  { name: "heroSecondaryTextVi", label: "Dòng phụ 2 VI", defaultValue: settings.heroSecondaryTextVi },
                  { name: "heroSecondaryTextEn", label: "Dòng phụ 2 EN", defaultValue: settings.heroSecondaryTextEn },
                  { name: "featuresSectionLabelVi", label: "Label features VI", defaultValue: settings.featuresSectionLabelVi },
                  { name: "featuresSectionLabelEn", label: "Label features EN", defaultValue: settings.featuresSectionLabelEn },
                  { name: "featuresSectionTitleVi", label: "Title features VI", defaultValue: settings.featuresSectionTitleVi },
                  { name: "featuresSectionTitleEn", label: "Title features EN", defaultValue: settings.featuresSectionTitleEn },
                  { name: "featuresSectionDescriptionVi", label: "Mô tả features VI", defaultValue: settings.featuresSectionDescriptionVi, type: "textarea", rows: 3 },
                  { name: "featuresSectionDescriptionEn", label: "Mô tả features EN", defaultValue: settings.featuresSectionDescriptionEn, type: "textarea", rows: 3 },
                  { name: "demoSectionLabelVi", label: "Label demo VI", defaultValue: settings.demoSectionLabelVi },
                  { name: "demoSectionLabelEn", label: "Label demo EN", defaultValue: settings.demoSectionLabelEn },
                  { name: "demoSectionTitleVi", label: "Title demo VI", defaultValue: settings.demoSectionTitleVi },
                  { name: "demoSectionTitleEn", label: "Title demo EN", defaultValue: settings.demoSectionTitleEn },
                  { name: "demoSectionDescriptionVi", label: "Mô tả demo VI", defaultValue: settings.demoSectionDescriptionVi, type: "textarea", rows: 3 },
                  { name: "demoSectionDescriptionEn", label: "Mô tả demo EN", defaultValue: settings.demoSectionDescriptionEn, type: "textarea", rows: 3 },
                  { name: "plansSectionLabelVi", label: "Label gói VI", defaultValue: settings.plansSectionLabelVi },
                  { name: "plansSectionLabelEn", label: "Label gói EN", defaultValue: settings.plansSectionLabelEn },
                  { name: "plansSectionTitleVi", label: "Title gói VI", defaultValue: settings.plansSectionTitleVi },
                  { name: "plansSectionTitleEn", label: "Title gói EN", defaultValue: settings.plansSectionTitleEn },
                  { name: "plansSectionDescriptionVi", label: "Mô tả gói VI", defaultValue: settings.plansSectionDescriptionVi, type: "textarea", rows: 3 },
                  { name: "plansSectionDescriptionEn", label: "Mô tả gói EN", defaultValue: settings.plansSectionDescriptionEn, type: "textarea", rows: 3 },
                  { name: "faqSectionLabelVi", label: "Label FAQ VI", defaultValue: settings.faqSectionLabelVi },
                  { name: "faqSectionLabelEn", label: "Label FAQ EN", defaultValue: settings.faqSectionLabelEn },
                  { name: "faqSectionTitleVi", label: "Title FAQ VI", defaultValue: settings.faqSectionTitleVi },
                  { name: "faqSectionTitleEn", label: "Title FAQ EN", defaultValue: settings.faqSectionTitleEn },
                  { name: "heroPrimaryCtaLabelVi", label: "CTA chính VI", defaultValue: settings.heroPrimaryCtaLabelVi },
                  { name: "heroPrimaryCtaLabelEn", label: "CTA chính EN", defaultValue: settings.heroPrimaryCtaLabelEn },
                  { name: "heroPrimaryCtaHref", label: "Link CTA chính", defaultValue: settings.heroPrimaryCtaHref },
                  { name: "heroSecondaryCtaLabelVi", label: "CTA phụ VI", defaultValue: settings.heroSecondaryCtaLabelVi },
                  { name: "heroSecondaryCtaLabelEn", label: "CTA phụ EN", defaultValue: settings.heroSecondaryCtaLabelEn },
                  { name: "heroSecondaryCtaHref", label: "Link CTA phụ", defaultValue: settings.heroSecondaryCtaHref },
                  { name: "announcementTextVi", label: "Announcement VI", defaultValue: settings.announcementTextVi, type: "textarea", rows: 3 },
                  { name: "announcementTextEn", label: "Announcement EN", defaultValue: settings.announcementTextEn, type: "textarea", rows: 3 },
                  { name: "announcementVisible", label: "Hiện announcement", type: "checkbox", defaultValue: String(settings.announcementVisible) },
                  { name: "showFeaturedPlansSection", label: "Hiện gói nổi bật", type: "checkbox", defaultValue: String(settings.showFeaturedPlansSection) },
                  { name: "showDonateSection", label: "Hiện ủng hộ tự do", type: "checkbox", defaultValue: String(settings.showDonateSection) },
                  { name: "showFaqSection", label: "Hiện FAQ", type: "checkbox", defaultValue: String(settings.showFaqSection) },
                  { name: "heroImagePath", label: "Ảnh hero", defaultValue: settings.heroImagePath ?? "" },
                  { name: "heroImageAltVi", label: "Alt ảnh VI", defaultValue: settings.heroImageAltVi ?? "" },
                  { name: "heroImageAltEn", label: "Alt ảnh EN", defaultValue: settings.heroImageAltEn ?? "" },
                  { name: "heroChips", label: "JSON chip hero", type: "textarea", rows: 8, defaultValue: heroChips },
                  { name: "featureCards", label: "JSON feature cards", type: "textarea", rows: 14, defaultValue: featureCards },
                  { name: "workflowSteps", label: "JSON workflow steps", type: "textarea", rows: 10, defaultValue: workflowSteps },
                  { name: "planHighlights", label: "JSON so sánh gói", type: "textarea", rows: 10, defaultValue: planHighlights },
                  { name: "navigation", label: "JSON điều hướng", type: "textarea", rows: 8, defaultValue: JSON.stringify(settings.navigation, null, 2) },
                  { name: "footerNoteVi", label: "Ghi chú footer VI", defaultValue: settings.footerNoteVi },
                  { name: "footerNoteEn", label: "Ghi chú footer EN", defaultValue: settings.footerNoteEn },
                  { name: "faqItems", label: "JSON FAQ", type: "textarea", rows: 10, defaultValue: JSON.stringify(settings.faqItems, null, 2) }
                ]
              }
            ]}
            triggerLabel="Mở form chỉnh nội dung"
            drawerTitle="Chỉnh nội dung website"
            drawerDescription="Chỉnh toàn bộ homepage copy, menu, footer, FAQ, ảnh hero và toggle section trong một lần."
          />
        ) : (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-800">
            {errorMessage ?? "SITE_SETTINGS_DB_ERROR: Không thể tải site_settings."}
          </div>
        )}
        <div className="space-y-6">
          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold">Xem trước homepage</h3>
            {settings ? (
              <div className="mt-4 space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-xs font-semibold text-blue-600">
                  {settings.heroEyebrowEn}
                </p>
                <h4 className="text-2xl font-semibold tracking-tight">{settings.heroTitleEn}</h4>
                <p className="text-sm text-slate-600">{settings.heroDescriptionEn}</p>
                <div className="flex flex-wrap gap-3">
                  <span className="rounded-full bg-slate-950 px-4 py-2 text-xs font-medium text-white">
                    {settings.heroPrimaryCtaLabelEn}
                  </span>
                  <span className="rounded-full border border-slate-300 px-4 py-2 text-xs font-medium text-slate-700">
                    {settings.heroSecondaryCtaLabelEn}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {settings.heroChips.filter((item) => item.visible).slice(0, 6).map((item) => (
                    <span key={item.labelEn} className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-medium text-slate-600">
                      {item.labelEn}
                    </span>
                  ))}
                </div>
                <div className="grid gap-2 text-xs text-slate-500 sm:grid-cols-2">
                  <p>Announcement: {settings.announcementVisible ? "Hiện" : "Ẩn"}</p>
                  <p>FAQ: {settings.showFaqSection ? "Hiện" : "Ẩn"}</p>
                  <p>Gói license: {settings.showFeaturedPlansSection ? "Hiện" : "Ẩn"}</p>
                  <p>Ủng hộ tự do: {settings.showDonateSection ? "Hiện" : "Ẩn"}</p>
                </div>
              </div>
            ) : (
              <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-500">
                Không có preview vì site_settings đang lỗi DB.
              </div>
            )}
          </article>
        </div>
      </div>
    </section>
  );
}
