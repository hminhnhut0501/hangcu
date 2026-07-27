import { SiteContentManager } from "@/components/admin/site-content-manager";
import { getSiteContentSettingsWithSource } from "@/modules/site-settings/service";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminSiteSettingsPage() {
  let settings = null as Awaited<ReturnType<typeof getSiteContentSettingsWithSource>>["settings"] | null;
  let source = null as Awaited<ReturnType<typeof getSiteContentSettingsWithSource>>["source"] | null;
  let errorMessage: string | null = null;

  try {
    const result = await getSiteContentSettingsWithSource();
    settings = result.settings;
    source = result.source;
  } catch (error) {
    errorMessage = error instanceof Error ? error.message : "SITE_SETTINGS_DB_ERROR: Không thể tải site_settings.";
  }

  return (
    <section>
      {settings ? (
        <SiteContentManager initialSettings={settings} source={source} errorMessage={errorMessage} />
      ) : (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-800">
          {errorMessage ?? "SITE_SETTINGS_DB_ERROR: Không thể tải site_settings."}
        </div>
      )}
    </section>
  );
}
