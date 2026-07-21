import { z } from "zod";

const navigationItemSchema = z.object({
  label: z.string().min(1),
  href: z.string().min(1),
  visible: z.boolean()
});

const faqItemSchema = z.object({
  questionVi: z.string().min(1),
  answerVi: z.string().min(1),
  questionEn: z.string().min(1),
  answerEn: z.string().min(1),
  visible: z.boolean()
});

export const siteContentSettingsSchema = z.object({
  id: z.string(),
  siteNameVi: z.string().min(1),
  siteNameEn: z.string().min(1),
  heroEyebrowVi: z.string().min(1),
  heroEyebrowEn: z.string().min(1),
  heroTitleVi: z.string().min(1),
  heroTitleEn: z.string().min(1),
  heroDescriptionVi: z.string().min(1),
  heroDescriptionEn: z.string().min(1),
  heroSecondaryTextVi: z.string().min(1),
  heroSecondaryTextEn: z.string().min(1),
  heroPrimaryCtaLabelVi: z.string().min(1),
  heroPrimaryCtaLabelEn: z.string().min(1),
  heroPrimaryCtaHref: z.string().min(1),
  heroSecondaryCtaLabelVi: z.string().min(1),
  heroSecondaryCtaLabelEn: z.string().min(1),
  heroSecondaryCtaHref: z.string().min(1),
  heroImagePath: z.string().nullable(),
  heroImageAltVi: z.string().nullable(),
  heroImageAltEn: z.string().nullable(),
  announcementTextVi: z.string().min(1),
  announcementTextEn: z.string().min(1),
  announcementVisible: z.boolean(),
  showFeaturedPlansSection: z.boolean(),
  showDonateSection: z.boolean(),
  showFaqSection: z.boolean(),
  navigation: z.array(navigationItemSchema),
  footerNoteVi: z.string().min(1),
  footerNoteEn: z.string().min(1),
  faqItems: z.array(faqItemSchema),
  updatedAt: z.string()
});
