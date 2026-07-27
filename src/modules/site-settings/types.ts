export type SiteNavigationItem = {
  label: string;
  href: string;
  visible: boolean;
};

export type SiteFaqItem = {
  questionVi: string;
  answerVi: string;
  questionEn: string;
  answerEn: string;
  visible: boolean;
};

export type SiteListItem = {
  labelVi: string;
  labelEn: string;
  textVi: string;
  textEn: string;
  visible: boolean;
};

export type SiteWorkflowStep = {
  stepVi: string;
  stepEn: string;
  visible: boolean;
};

export type SiteHeroChip = {
  labelVi: string;
  labelEn: string;
  visible: boolean;
};

export type SitePaymentGateway = {
  provider: "payos" | "paypal" | "lemonsqueezy" | "sandbox" | "manual";
  labelVi: string;
  labelEn: string;
  currencies: Array<"VND" | "USD">;
  visible: boolean;
};

export type SiteContentSettings = {
  id: string;
  siteNameVi: string;
  siteNameEn: string;
  heroEyebrowVi: string;
  heroEyebrowEn: string;
  heroTitleVi: string;
  heroTitleEn: string;
  heroDescriptionVi: string;
  heroDescriptionEn: string;
  heroSecondaryTextVi: string;
  heroSecondaryTextEn: string;
  featuresSectionLabelVi: string;
  featuresSectionLabelEn: string;
  featuresSectionTitleVi: string;
  featuresSectionTitleEn: string;
  featuresSectionDescriptionVi: string;
  featuresSectionDescriptionEn: string;
  demoSectionLabelVi: string;
  demoSectionLabelEn: string;
  demoSectionTitleVi: string;
  demoSectionTitleEn: string;
  demoSectionDescriptionVi: string;
  demoSectionDescriptionEn: string;
  plansSectionLabelVi: string;
  plansSectionLabelEn: string;
  plansSectionTitleVi: string;
  plansSectionTitleEn: string;
  plansSectionDescriptionVi: string;
  plansSectionDescriptionEn: string;
  faqSectionLabelVi: string;
  faqSectionLabelEn: string;
  faqSectionTitleVi: string;
  faqSectionTitleEn: string;
  heroPrimaryCtaLabelVi: string;
  heroPrimaryCtaLabelEn: string;
  heroPrimaryCtaHref: string;
  heroSecondaryCtaLabelVi: string;
  heroSecondaryCtaLabelEn: string;
  heroSecondaryCtaHref: string;
  heroImagePath: string | null;
  heroImageAltVi: string | null;
  heroImageAltEn: string | null;
  announcementTextVi: string;
  announcementTextEn: string;
  announcementVisible: boolean;
  showFeaturedPlansSection: boolean;
  showDonateSection: boolean;
  showFaqSection: boolean;
  navigation: SiteNavigationItem[];
  footerNoteVi: string;
  footerNoteEn: string;
  faqItems: SiteFaqItem[];
  heroChips: SiteHeroChip[];
  featureCards: SiteListItem[];
  workflowSteps: SiteWorkflowStep[];
  planHighlights: SiteListItem[];
  paymentGateways: SitePaymentGateway[];
  updatedAt: string;
};
