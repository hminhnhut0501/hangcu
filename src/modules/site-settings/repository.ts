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
  heroPrimaryCtaLabelVi: "Xem gói license",
  heroPrimaryCtaLabelEn: "Browse license plans",
  heroPrimaryCtaHref: "/products",
  heroSecondaryCtaLabelVi: "Bắt đầu checkout",
  heroSecondaryCtaLabelEn: "Start checkout",
  heroSecondaryCtaHref: "/checkout",
  heroImagePath: null,
  heroImageAltVi: null,
  heroImageAltEn: null,
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
    { label: "Tải xuống", href: "/download", visible: true },
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
