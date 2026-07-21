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
  updatedAt: string;
};
