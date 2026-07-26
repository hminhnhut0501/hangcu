import { getSupabaseServiceClient } from "@/lib/db/supabase-server";
import { siteContentSettingsSchema } from "./schema";
import type { SiteContentSettings } from "./types";

const defaultSettings: SiteContentSettings = {
  id: "global",
  siteNameVi: "Hang Cú video",
  siteNameEn: "Hang Cú Video",
  heroEyebrowVi: "Cửa hàng license cho Hang Cú video",
  heroEyebrowEn: "License storefront for Hang Cú video",
  heroTitleVi: "Bán license phần mềm theo gói 30 ngày và trọn đời.",
  heroTitleEn: "Sell software licenses with 30-day and lifetime plans.",
  heroDescriptionVi: "Mua license bằng vài bước đơn giản, nhận key qua email và có gói hỗ trợ riêng nếu cần.",
  heroDescriptionEn: "The store supports Vietnamese and English, with auto-issued license keys and a separate optional support package.",
  heroSecondaryTextVi: "Thiết kế gọn nhẹ cho lượng đơn nhỏ mỗi tháng, nhưng vẫn sẵn sàng mở rộng khi cần.",
  heroSecondaryTextEn: "Suitable for a few dozen orders per month and easy to scale later.",
  featuresSectionLabelVi: "Tính năng của app",
  featuresSectionLabelEn: "App features",
  featuresSectionTitleVi: "Tám module chính, làm đúng việc, không thừa",
  featuresSectionTitleEn: "Core modules that do one job well",
  featuresSectionDescriptionVi: "Đây là app xử lý video thật, không phải website giới thiệu chung chung.",
  featuresSectionDescriptionEn: "This is a real video-processing app, not a vague product landing page.",
  demoSectionLabelVi: "Ảnh app thật",
  demoSectionLabelEn: "Real app screenshot",
  demoSectionTitleVi: "Demo và ảnh thật của app",
  demoSectionTitleEn: "Product demo and real screenshots",
  demoSectionDescriptionVi: "Xem giao diện thực, video demo và workflow chính trong một chỗ.",
  demoSectionDescriptionEn: "See the real UI, demo video, and core workflow in one place.",
  plansSectionLabelVi: "Gói license",
  plansSectionLabelEn: "License plans",
  plansSectionTitleVi: "2 gói bản quyền chính và các gói support riêng",
  plansSectionTitleEn: "Two main licenses plus separate support packages",
  plansSectionDescriptionVi: "Chọn license 30 ngày, trọn đời, hoặc thêm support package nếu muốn ủng hộ.",
  plansSectionDescriptionEn: "Choose the 30-day license, lifetime license, or add a separate support package.",
  faqSectionLabelVi: "FAQ",
  faqSectionLabelEn: "FAQ",
  faqSectionTitleVi: "Câu hỏi khách hay hỏi trước khi mua",
  faqSectionTitleEn: "Questions customers usually ask before buying",
  heroPrimaryCtaLabelVi: "Xem gói license",
  heroPrimaryCtaLabelEn: "Browse license plans",
  heroPrimaryCtaHref: "/products",
  heroSecondaryCtaLabelVi: "Bắt đầu checkout",
  heroSecondaryCtaLabelEn: "Start checkout",
  heroSecondaryCtaHref: "/checkout",
  heroImagePath: "/brand/hangcu-hero-macbook.png",
  heroImageAltVi: "Ảnh hero của Hang Cú video",
  heroImageAltEn: "Hang Cú video hero image",
  announcementTextVi: "Đang mở bán license Hang Cú video.",
  announcementTextEn: "Now selling Hang Cú video licenses.",
  announcementVisible: true,
  showFeaturedPlansSection: true,
  showDonateSection: true,
  showFaqSection: true,
  navigation: [
    { label: "Gói license", href: "/products", visible: true },
    { label: "Bảng giá", href: "/pricing", visible: true },
    { label: "Supporter packages", href: "/collections", visible: true },
    { label: "Download", href: "/download", visible: true },
    { label: "Thanh toán", href: "/checkout", visible: true },
    { label: "Đơn hàng", href: "/orders", visible: true },
    { label: "Hỗ trợ", href: "/contact", visible: true }
  ],
  footerNoteVi: "Bản storefront song ngữ cho Hang Cú video, chỉ bán license phần mềm.",
  footerNoteEn: "Bilingual storefront for Hang Cú video, selling software licenses only.",
  faqItems: [
    {
      questionVi: "License 30 ngày là gì?",
      answerVi: "Đây là gói truy cập có thời hạn 30 ngày.",
      questionEn: "What is the 30-day license?",
      answerEn: "It is a time-limited access plan for 30 days.",
      visible: true
    },
    {
      questionVi: "License trọn đời là gì?",
      answerVi: "Đây là gói dùng vĩnh viễn theo điều khoản sản phẩm.",
      questionEn: "What is the lifetime license?",
      answerEn: "It is permanent access under the product terms.",
      visible: true
    }
  ],
  heroChips: [
    { labelVi: "Join", labelEn: "Join", visible: true },
    { labelVi: "Cut", labelEn: "Cut", visible: true },
    { labelVi: "Thumb / Face Find", labelEn: "Thumb / Face Find", visible: true },
    { labelVi: "Watermark", labelEn: "Watermark", visible: true },
    { labelVi: "Intro / Outro", labelEn: "Intro / Outro", visible: true },
    { labelVi: "Optimize / Encode", labelEn: "Optimize / Encode", visible: true }
  ],
  featureCards: [
    {
      labelVi: "Join",
      labelEn: "Join",
      textVi: "Ghép nhiều clip theo đúng thứ tự, có kéo thả để đổi thứ tự.",
      textEn: "Merge clips in order, with drag-and-drop reordering.",
      visible: true
    },
    {
      labelVi: "Cut",
      labelEn: "Cut",
      textVi: "Cắt đầu video hàng loạt để trim nhanh trên nhiều file.",
      textEn: "Trim the head of many videos in one fast batch.",
      visible: true
    },
    {
      labelVi: "Thumb / Face Find",
      labelEn: "Thumb / Face Find",
      textVi: "Xuất thumbnail, contact sheet, chọn frame, chia grid, chỉnh chất lượng.",
      textEn: "Export thumbnails and contact sheets with frame, grid, and quality controls.",
      visible: true
    },
    {
      labelVi: "Watermark",
      labelEn: "Watermark",
      textVi: "Thêm watermark đầy đủ hoặc watermark ẩn cho video.",
      textEn: "Add visible or hidden watermarks to video files.",
      visible: true
    }
  ],
  workflowSteps: [
    { stepVi: "Kéo video vào module", stepEn: "Drag files into a module", visible: true },
    { stepVi: "Chọn preset / grid / chất lượng", stepEn: "Choose preset / grid / quality", visible: true },
    { stepVi: "Bấm xử lý hàng loạt", stepEn: "Run batch processing", visible: true },
    { stepVi: "Xuất file sạch ngay", stepEn: "Export clean output", visible: true }
  ],
  planHighlights: [
    {
      labelVi: "30 ngày",
      labelEn: "30 days",
      textVi: "Dùng ngắn hạn, test workflow, đổi máy dễ hơn",
      textEn: "Short-term use and workflow testing",
      visible: true
    },
    {
      labelVi: "Trọn đời",
      labelEn: "Lifetime",
      textVi: "Một lần thanh toán, dùng lâu dài",
      textEn: "One-time payment, long-term use",
      visible: true
    },
    {
      labelVi: "Support package",
      labelEn: "Support package",
      textVi: "Tách riêng, không trộn với license",
      textEn: "Separate from the license purchase",
      visible: true
    }
  ],
  updatedAt: new Date().toISOString()
};

function normalize(value: unknown): SiteContentSettings {
  const candidate = siteContentSettingsSchema.safeParse(value);
  return candidate.success ? candidate.data : defaultSettings;
}

function mapRowToSettings(row: Record<string, unknown>): SiteContentSettings {
  return normalize({
    id: String(row.id ?? "global"),
    siteNameVi: String(row.site_name_vi ?? defaultSettings.siteNameVi),
    siteNameEn: String(row.site_name_en ?? defaultSettings.siteNameEn),
    heroEyebrowVi: String(row.hero_eyebrow_vi ?? defaultSettings.heroEyebrowVi),
    heroEyebrowEn: String(row.hero_eyebrow_en ?? defaultSettings.heroEyebrowEn),
    heroTitleVi: String(row.hero_title_vi ?? defaultSettings.heroTitleVi),
    heroTitleEn: String(row.hero_title_en ?? defaultSettings.heroTitleEn),
    heroDescriptionVi: String(row.hero_description_vi ?? defaultSettings.heroDescriptionVi),
    heroDescriptionEn: String(row.hero_description_en ?? defaultSettings.heroDescriptionEn),
    heroSecondaryTextVi: String(row.hero_secondary_text_vi ?? defaultSettings.heroSecondaryTextVi),
    heroSecondaryTextEn: String(row.hero_secondary_text_en ?? defaultSettings.heroSecondaryTextEn),
    featuresSectionLabelVi: String(row.features_section_label_vi ?? defaultSettings.featuresSectionLabelVi),
    featuresSectionLabelEn: String(row.features_section_label_en ?? defaultSettings.featuresSectionLabelEn),
    featuresSectionTitleVi: String(row.features_section_title_vi ?? defaultSettings.featuresSectionTitleVi),
    featuresSectionTitleEn: String(row.features_section_title_en ?? defaultSettings.featuresSectionTitleEn),
    featuresSectionDescriptionVi: String(row.features_section_description_vi ?? defaultSettings.featuresSectionDescriptionVi),
    featuresSectionDescriptionEn: String(row.features_section_description_en ?? defaultSettings.featuresSectionDescriptionEn),
    demoSectionLabelVi: String(row.demo_section_label_vi ?? defaultSettings.demoSectionLabelVi),
    demoSectionLabelEn: String(row.demo_section_label_en ?? defaultSettings.demoSectionLabelEn),
    demoSectionTitleVi: String(row.demo_section_title_vi ?? defaultSettings.demoSectionTitleVi),
    demoSectionTitleEn: String(row.demo_section_title_en ?? defaultSettings.demoSectionTitleEn),
    demoSectionDescriptionVi: String(row.demo_section_description_vi ?? defaultSettings.demoSectionDescriptionVi),
    demoSectionDescriptionEn: String(row.demo_section_description_en ?? defaultSettings.demoSectionDescriptionEn),
    plansSectionLabelVi: String(row.plans_section_label_vi ?? defaultSettings.plansSectionLabelVi),
    plansSectionLabelEn: String(row.plans_section_label_en ?? defaultSettings.plansSectionLabelEn),
    plansSectionTitleVi: String(row.plans_section_title_vi ?? defaultSettings.plansSectionTitleVi),
    plansSectionTitleEn: String(row.plans_section_title_en ?? defaultSettings.plansSectionTitleEn),
    plansSectionDescriptionVi: String(row.plans_section_description_vi ?? defaultSettings.plansSectionDescriptionVi),
    plansSectionDescriptionEn: String(row.plans_section_description_en ?? defaultSettings.plansSectionDescriptionEn),
    faqSectionLabelVi: String(row.faq_section_label_vi ?? defaultSettings.faqSectionLabelVi),
    faqSectionLabelEn: String(row.faq_section_label_en ?? defaultSettings.faqSectionLabelEn),
    faqSectionTitleVi: String(row.faq_section_title_vi ?? defaultSettings.faqSectionTitleVi),
    faqSectionTitleEn: String(row.faq_section_title_en ?? defaultSettings.faqSectionTitleEn),
    heroPrimaryCtaLabelVi: String(row.hero_primary_cta_label_vi ?? defaultSettings.heroPrimaryCtaLabelVi),
    heroPrimaryCtaLabelEn: String(row.hero_primary_cta_label_en ?? defaultSettings.heroPrimaryCtaLabelEn),
    heroPrimaryCtaHref: String(row.hero_primary_cta_href ?? defaultSettings.heroPrimaryCtaHref),
    heroSecondaryCtaLabelVi: String(row.hero_secondary_cta_label_vi ?? defaultSettings.heroSecondaryCtaLabelVi),
    heroSecondaryCtaLabelEn: String(row.hero_secondary_cta_label_en ?? defaultSettings.heroSecondaryCtaLabelEn),
    heroSecondaryCtaHref: String(row.hero_secondary_cta_href ?? defaultSettings.heroSecondaryCtaHref),
    heroImagePath: row.hero_image_path ? String(row.hero_image_path) : null,
    heroImageAltVi: row.hero_image_alt_vi ? String(row.hero_image_alt_vi) : null,
    heroImageAltEn: row.hero_image_alt_en ? String(row.hero_image_alt_en) : null,
    announcementTextVi: String(row.announcement_text_vi ?? defaultSettings.announcementTextVi),
    announcementTextEn: String(row.announcement_text_en ?? defaultSettings.announcementTextEn),
    announcementVisible: Boolean(row.announcement_visible ?? defaultSettings.announcementVisible),
    showFeaturedPlansSection: Boolean(row.show_featured_plans_section ?? defaultSettings.showFeaturedPlansSection),
    showDonateSection: Boolean(row.show_donate_section ?? defaultSettings.showDonateSection),
    showFaqSection: Boolean(row.show_faq_section ?? defaultSettings.showFaqSection),
    navigation: Array.isArray(row.navigation) ? row.navigation : defaultSettings.navigation,
    footerNoteVi: String(row.footer_note_vi ?? defaultSettings.footerNoteVi),
    footerNoteEn: String(row.footer_note_en ?? defaultSettings.footerNoteEn),
    faqItems: Array.isArray(row.faq_items) ? row.faq_items : defaultSettings.faqItems,
    heroChips: Array.isArray(row.hero_chips) ? row.hero_chips : defaultSettings.heroChips,
    featureCards: Array.isArray(row.feature_cards) ? row.feature_cards : defaultSettings.featureCards,
    workflowSteps: Array.isArray(row.workflow_steps) ? row.workflow_steps : defaultSettings.workflowSteps,
    planHighlights: Array.isArray(row.plan_highlights) ? row.plan_highlights : defaultSettings.planHighlights,
    updatedAt: String(row.updated_at ?? defaultSettings.updatedAt)
  });
}

export class InMemorySiteSettingsRepository {
  private settings = defaultSettings;

  async get(): Promise<SiteContentSettings> {
    return this.settings;
  }

  async save(settings: SiteContentSettings): Promise<SiteContentSettings> {
    this.settings = normalize(settings);
    return this.settings;
  }
}

export class SupabaseSiteSettingsRepository {
  private client = getSupabaseServiceClient();
  private memory = new InMemorySiteSettingsRepository();

  async get(): Promise<SiteContentSettings> {
    if (!this.client) {
      return this.memory.get();
    }

    const { data, error } = await this.client
      .from("site_settings")
      .select("*")
      .eq("id", "global")
      .maybeSingle();

    if (error) {
      if (error.code === "PGRST205" || String(error.message ?? "").includes("site_settings")) {
        return this.memory.get();
      }
      throw error;
    }
    return data ? mapRowToSettings(data as Record<string, unknown>) : defaultSettings;
  }

  async save(settings: SiteContentSettings): Promise<SiteContentSettings> {
    const normalized = normalize(settings);

    if (!this.client) {
      return this.memory.save(normalized);
    }

    const { error } = await this.client.from("site_settings").upsert({
      id: normalized.id,
      site_name_vi: normalized.siteNameVi,
      site_name_en: normalized.siteNameEn,
      hero_eyebrow_vi: normalized.heroEyebrowVi,
      hero_eyebrow_en: normalized.heroEyebrowEn,
      hero_title_vi: normalized.heroTitleVi,
      hero_title_en: normalized.heroTitleEn,
      hero_description_vi: normalized.heroDescriptionVi,
      hero_description_en: normalized.heroDescriptionEn,
      hero_secondary_text_vi: normalized.heroSecondaryTextVi,
      hero_secondary_text_en: normalized.heroSecondaryTextEn,
      features_section_label_vi: normalized.featuresSectionLabelVi,
      features_section_label_en: normalized.featuresSectionLabelEn,
      features_section_title_vi: normalized.featuresSectionTitleVi,
      features_section_title_en: normalized.featuresSectionTitleEn,
      features_section_description_vi: normalized.featuresSectionDescriptionVi,
      features_section_description_en: normalized.featuresSectionDescriptionEn,
      demo_section_label_vi: normalized.demoSectionLabelVi,
      demo_section_label_en: normalized.demoSectionLabelEn,
      demo_section_title_vi: normalized.demoSectionTitleVi,
      demo_section_title_en: normalized.demoSectionTitleEn,
      demo_section_description_vi: normalized.demoSectionDescriptionVi,
      demo_section_description_en: normalized.demoSectionDescriptionEn,
      plans_section_label_vi: normalized.plansSectionLabelVi,
      plans_section_label_en: normalized.plansSectionLabelEn,
      plans_section_title_vi: normalized.plansSectionTitleVi,
      plans_section_title_en: normalized.plansSectionTitleEn,
      plans_section_description_vi: normalized.plansSectionDescriptionVi,
      plans_section_description_en: normalized.plansSectionDescriptionEn,
      faq_section_label_vi: normalized.faqSectionLabelVi,
      faq_section_label_en: normalized.faqSectionLabelEn,
      faq_section_title_vi: normalized.faqSectionTitleVi,
      faq_section_title_en: normalized.faqSectionTitleEn,
      hero_primary_cta_label_vi: normalized.heroPrimaryCtaLabelVi,
      hero_primary_cta_label_en: normalized.heroPrimaryCtaLabelEn,
      hero_primary_cta_href: normalized.heroPrimaryCtaHref,
      hero_secondary_cta_label_vi: normalized.heroSecondaryCtaLabelVi,
      hero_secondary_cta_label_en: normalized.heroSecondaryCtaLabelEn,
      hero_secondary_cta_href: normalized.heroSecondaryCtaHref,
      hero_image_path: normalized.heroImagePath,
      hero_image_alt_vi: normalized.heroImageAltVi,
      hero_image_alt_en: normalized.heroImageAltEn,
      announcement_text_vi: normalized.announcementTextVi,
      announcement_text_en: normalized.announcementTextEn,
      announcement_visible: normalized.announcementVisible,
      show_featured_plans_section: normalized.showFeaturedPlansSection,
      show_donate_section: normalized.showDonateSection,
      show_faq_section: normalized.showFaqSection,
      navigation: normalized.navigation,
      footer_note_vi: normalized.footerNoteVi,
      footer_note_en: normalized.footerNoteEn,
      faq_items: normalized.faqItems,
      hero_chips: normalized.heroChips,
      feature_cards: normalized.featureCards,
      workflow_steps: normalized.workflowSteps,
      plan_highlights: normalized.planHighlights,
      updated_at: normalized.updatedAt
    });

    if (error) {
      if (error.code === "PGRST205" || String(error.message ?? "").includes("site_settings")) {
        return this.memory.save(normalized);
      }
      throw error;
    }
    return normalized;
  }
}
