import { SimpleAdminForm } from "@/components/admin/simple-form";
import { getSiteContentSettings } from "@/modules/site-settings/service";

export default async function AdminSiteSettingsPage() {
  const settings = await getSiteContentSettings();

  return (
    <section className="space-y-8">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.3em] text-blue-600">
          Nội dung
        </p>
        <h2 className="mt-3 text-4xl font-semibold tracking-tight">Cài đặt nội dung website</h2>
        <p className="mt-2 max-w-3xl text-sm text-slate-600">
          Quản lý hero, menu, footer, FAQ, announcement và các section toggle cho storefront.
        </p>
      </div>
      <div className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
        <SimpleAdminForm
          endpoint="/api/admin/site-settings"
          submitLabel="Lưu nội dung"
          onSuccessMessage="Đã cập nhật nội dung website."
          sections={[
            {
              title: "Nền tảng thương hiệu",
              description: "Tên site và ngôn ngữ hiển thị chính cho storefront.",
              fields: [
                { name: "siteNameVi", label: "Tên site VI", defaultValue: settings.siteNameVi },
                { name: "siteNameEn", label: "Tên site EN", defaultValue: settings.siteNameEn }
              ]
            },
            {
              title: "Hero",
              description: "Nội dung đầu trang, CTA và copy giới thiệu sản phẩm.",
              fields: [
                { name: "heroEyebrowVi", label: "Dòng phụ VI", defaultValue: settings.heroEyebrowVi },
                { name: "heroEyebrowEn", label: "Dòng phụ EN", defaultValue: settings.heroEyebrowEn },
                { name: "heroTitleVi", label: "Tiêu đề VI", defaultValue: settings.heroTitleVi },
                { name: "heroTitleEn", label: "Tiêu đề EN", defaultValue: settings.heroTitleEn },
                { name: "heroDescriptionVi", label: "Mô tả VI", defaultValue: settings.heroDescriptionVi, type: "textarea", rows: 4 },
                { name: "heroDescriptionEn", label: "Mô tả EN", defaultValue: settings.heroDescriptionEn, type: "textarea", rows: 4 },
                { name: "heroSecondaryTextVi", label: "Dòng phụ 2 VI", defaultValue: settings.heroSecondaryTextVi },
                { name: "heroSecondaryTextEn", label: "Dòng phụ 2 EN", defaultValue: settings.heroSecondaryTextEn },
                { name: "heroPrimaryCtaLabelVi", label: "CTA chính VI", defaultValue: settings.heroPrimaryCtaLabelVi },
                { name: "heroPrimaryCtaLabelEn", label: "CTA chính EN", defaultValue: settings.heroPrimaryCtaLabelEn },
                { name: "heroPrimaryCtaHref", label: "Link CTA chính", defaultValue: settings.heroPrimaryCtaHref },
                { name: "heroSecondaryCtaLabelVi", label: "CTA phụ VI", defaultValue: settings.heroSecondaryCtaLabelVi },
                { name: "heroSecondaryCtaLabelEn", label: "CTA phụ EN", defaultValue: settings.heroSecondaryCtaLabelEn },
                { name: "heroSecondaryCtaHref", label: "Link CTA phụ", defaultValue: settings.heroSecondaryCtaHref }
              ]
            },
            {
              title: "Hiển thị trang chủ",
              description: "Bật tắt từng section để ẩn nội dung chưa hoàn thiện.",
              fields: [
                { name: "announcementVisible", label: "Hiện announcement", type: "checkbox", defaultValue: String(settings.announcementVisible) },
                { name: "showFeaturedPlansSection", label: "Hiện gói nổi bật", type: "checkbox", defaultValue: String(settings.showFeaturedPlansSection) },
                { name: "showDonateSection", label: "Hiện donate", type: "checkbox", defaultValue: String(settings.showDonateSection) },
                { name: "showFaqSection", label: "Hiện FAQ", type: "checkbox", defaultValue: String(settings.showFaqSection) }
              ]
            },
            {
              title: "Announcement",
              description: "Thông báo ngắn gọn cho launch, maintenance hoặc campaign.",
              fields: [
                { name: "announcementTextVi", label: "Announcement VI", defaultValue: settings.announcementTextVi, type: "textarea", rows: 3 },
                { name: "announcementTextEn", label: "Announcement EN", defaultValue: settings.announcementTextEn, type: "textarea", rows: 3 }
              ]
            },
            {
              title: "Navigation",
              description: "Menu header lấy từ JSON, hỗ trợ bật/tắt từng mục.",
              fields: [
                { name: "navigation", label: "JSON điều hướng", type: "textarea", rows: 8, defaultValue: JSON.stringify(settings.navigation, null, 2) }
              ]
            },
            {
              title: "Footer và FAQ",
              description: "Bổ sung FAQ song ngữ và note cuối trang.",
              fields: [
                { name: "footerNoteVi", label: "Ghi chú footer VI", defaultValue: settings.footerNoteVi },
                { name: "footerNoteEn", label: "Ghi chú footer EN", defaultValue: settings.footerNoteEn },
                { name: "faqItems", label: "JSON FAQ", type: "textarea", rows: 10, defaultValue: JSON.stringify(settings.faqItems, null, 2) }
              ]
            }
          ]}
        />
        <div className="space-y-6">
          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold">Xem trước homepage</h3>
            <div className="mt-4 space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-600">
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
              <div className="grid gap-2 text-xs text-slate-500 sm:grid-cols-2">
                <p>Announcement: {settings.announcementVisible ? "Hiện" : "Ẩn"}</p>
                <p>FAQ: {settings.showFaqSection ? "Hiện" : "Ẩn"}</p>
                <p>Plans: {settings.showFeaturedPlansSection ? "Hiện" : "Ẩn"}</p>
                <p>Donate: {settings.showDonateSection ? "Hiện" : "Ẩn"}</p>
              </div>
            </div>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold">Quy trình nội dung</h3>
            <ul className="mt-4 space-y-2 text-sm text-slate-600">
              <li>Chỉnh hero và menu trước, rồi xem preview landing page.</li>
              <li>Giữ nội dung tiếng Việt và tiếng Anh khớp nhau trước khi publish.</li>
              <li>Dùng toggle section để ẩn nội dung chưa xong mà không cần sửa code.</li>
              <li>Lưu FAQ và footer trước khi gửi duyệt cổng thanh toán.</li>
            </ul>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold">Checklist nội dung</h3>
            <ul className="mt-4 space-y-2 text-sm text-slate-600">
              <li>Giữ hero song ngữ nhưng ngắn gọn.</li>
              <li>Dùng announcement cho launch hoặc bảo trì.</li>
              <li>Tắt/mở section để ẩn block chưa hoàn thiện mà không cần đổi code.</li>
              <li>Cập nhật FAQ trước khi nộp duyệt với cổng thanh toán.</li>
            </ul>
          </article>
        </div>
      </div>
    </section>
  );
}
