import { z } from "zod";
import { writeAuditLog } from "@/modules/audit/service";
import { requireAdminMutationAccess } from "@/modules/admin-auth/guard";
import { getAdminMutationContext } from "@/modules/admin-auth/context";
import { getSiteContentSettings, updateSiteContentSettings } from "@/modules/site-settings/service";

const schema = z.object({
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
  heroImagePath: z.string().nullable().optional(),
  heroImageAltVi: z.string().nullable().optional(),
  heroImageAltEn: z.string().nullable().optional(),
  announcementTextVi: z.string().min(1),
  announcementTextEn: z.string().min(1),
  announcementVisible: z.coerce.boolean(),
  showFeaturedPlansSection: z.coerce.boolean(),
  showDonateSection: z.coerce.boolean(),
  showFaqSection: z.coerce.boolean(),
  navigation: z.string().min(1),
  footerNoteVi: z.string().min(1),
  footerNoteEn: z.string().min(1),
  faqItems: z.string().min(1)
});

export async function GET() {
  const settings = await getSiteContentSettings();
  return Response.json({ success: true, data: settings });
}

export async function POST(request: Request) {
  await requireAdminMutationAccess("content_manager");
  const payload = await request.json().catch(() => null);
  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    return Response.json({ success: false, error: { code: "INVALID_REQUEST", message: "Request is invalid." } }, { status: 400 });
  }

  const current = await getSiteContentSettings();
  const settings = await updateSiteContentSettings({
    siteNameVi: parsed.data.siteNameVi,
    siteNameEn: parsed.data.siteNameEn,
    heroEyebrowVi: parsed.data.heroEyebrowVi,
    heroEyebrowEn: parsed.data.heroEyebrowEn,
    heroTitleVi: parsed.data.heroTitleVi,
    heroTitleEn: parsed.data.heroTitleEn,
    heroDescriptionVi: parsed.data.heroDescriptionVi,
    heroDescriptionEn: parsed.data.heroDescriptionEn,
    heroSecondaryTextVi: parsed.data.heroSecondaryTextVi,
    heroSecondaryTextEn: parsed.data.heroSecondaryTextEn,
    featuresSectionLabelVi: parsed.data.featuresSectionLabelVi,
    featuresSectionLabelEn: parsed.data.featuresSectionLabelEn,
    featuresSectionTitleVi: parsed.data.featuresSectionTitleVi,
    featuresSectionTitleEn: parsed.data.featuresSectionTitleEn,
    featuresSectionDescriptionVi: parsed.data.featuresSectionDescriptionVi,
    featuresSectionDescriptionEn: parsed.data.featuresSectionDescriptionEn,
    demoSectionLabelVi: parsed.data.demoSectionLabelVi,
    demoSectionLabelEn: parsed.data.demoSectionLabelEn,
    demoSectionTitleVi: parsed.data.demoSectionTitleVi,
    demoSectionTitleEn: parsed.data.demoSectionTitleEn,
    demoSectionDescriptionVi: parsed.data.demoSectionDescriptionVi,
    demoSectionDescriptionEn: parsed.data.demoSectionDescriptionEn,
    plansSectionLabelVi: parsed.data.plansSectionLabelVi,
    plansSectionLabelEn: parsed.data.plansSectionLabelEn,
    plansSectionTitleVi: parsed.data.plansSectionTitleVi,
    plansSectionTitleEn: parsed.data.plansSectionTitleEn,
    plansSectionDescriptionVi: parsed.data.plansSectionDescriptionVi,
    plansSectionDescriptionEn: parsed.data.plansSectionDescriptionEn,
    faqSectionLabelVi: parsed.data.faqSectionLabelVi,
    faqSectionLabelEn: parsed.data.faqSectionLabelEn,
    faqSectionTitleVi: parsed.data.faqSectionTitleVi,
    faqSectionTitleEn: parsed.data.faqSectionTitleEn,
    heroPrimaryCtaLabelVi: parsed.data.heroPrimaryCtaLabelVi,
    heroPrimaryCtaLabelEn: parsed.data.heroPrimaryCtaLabelEn,
    heroPrimaryCtaHref: parsed.data.heroPrimaryCtaHref,
    heroSecondaryCtaLabelVi: parsed.data.heroSecondaryCtaLabelVi,
    heroSecondaryCtaLabelEn: parsed.data.heroSecondaryCtaLabelEn,
    heroSecondaryCtaHref: parsed.data.heroSecondaryCtaHref,
    heroImagePath: parsed.data.heroImagePath ?? null,
    heroImageAltVi: parsed.data.heroImageAltVi ?? null,
    heroImageAltEn: parsed.data.heroImageAltEn ?? null,
    announcementTextVi: parsed.data.announcementTextVi,
    announcementTextEn: parsed.data.announcementTextEn,
    announcementVisible: parsed.data.announcementVisible,
    showFeaturedPlansSection: parsed.data.showFeaturedPlansSection,
    showDonateSection: parsed.data.showDonateSection,
    showFaqSection: parsed.data.showFaqSection,
    navigation: JSON.parse(parsed.data.navigation),
    footerNoteVi: parsed.data.footerNoteVi,
    footerNoteEn: parsed.data.footerNoteEn,
    faqItems: JSON.parse(parsed.data.faqItems)
  });

  await writeAuditLog({
    ...getAdminMutationContext(),
    action: "site_settings_updated",
    entityType: "site_settings",
    entityId: current.id,
    afterData: settings
  });

  return Response.json({ success: true, data: settings });
}
