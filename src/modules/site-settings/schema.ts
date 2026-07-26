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

const listItemSchema = z.object({
  labelVi: z.string().min(1),
  labelEn: z.string().min(1),
  textVi: z.string().min(1),
  textEn: z.string().min(1),
  visible: z.boolean()
});

const workflowStepSchema = z.object({
  stepVi: z.string().min(1),
  stepEn: z.string().min(1),
  visible: z.boolean()
});

const heroChipSchema = z.object({
  labelVi: z.string().min(1),
  labelEn: z.string().min(1),
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
  featuresSectionLabelVi: z.string().min(1),
  featuresSectionLabelEn: z.string().min(1),
  featuresSectionTitleVi: z.string().min(1),
  featuresSectionTitleEn: z.string().min(1),
  featuresSectionDescriptionVi: z.string().min(1),
  featuresSectionDescriptionEn: z.string().min(1),
  demoSectionLabelVi: z.string().min(1),
  demoSectionLabelEn: z.string().min(1),
  demoSectionTitleVi: z.string().min(1),
  demoSectionTitleEn: z.string().min(1),
  demoSectionDescriptionVi: z.string().min(1),
  demoSectionDescriptionEn: z.string().min(1),
  plansSectionLabelVi: z.string().min(1),
  plansSectionLabelEn: z.string().min(1),
  plansSectionTitleVi: z.string().min(1),
  plansSectionTitleEn: z.string().min(1),
  plansSectionDescriptionVi: z.string().min(1),
  plansSectionDescriptionEn: z.string().min(1),
  faqSectionLabelVi: z.string().min(1),
  faqSectionLabelEn: z.string().min(1),
  faqSectionTitleVi: z.string().min(1),
  faqSectionTitleEn: z.string().min(1),
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
  heroChips: z.array(heroChipSchema),
  featureCards: z.array(listItemSchema),
  workflowSteps: z.array(workflowStepSchema),
  planHighlights: z.array(listItemSchema),
  updatedAt: z.string()
});
