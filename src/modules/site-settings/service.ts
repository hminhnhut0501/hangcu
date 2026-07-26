import { InMemorySiteSettingsRepository, SupabaseSiteSettingsRepository } from "./repository";
import type { SiteContentSettings } from "./types";

const repository = new SupabaseSiteSettingsRepository();

export async function getSiteContentSettings(): Promise<SiteContentSettings> {
  return repository.get();
}

export async function getSiteContentSettingsWithSource(): Promise<{
  settings: SiteContentSettings;
  source: "supabase" | "fallback";
}> {
  return repository.getWithSource();
}

export async function updateSiteContentSettings(input: Partial<SiteContentSettings>) {
  const current = await repository.get();
  return repository.save({
    ...current,
    ...input,
    updatedAt: new Date().toISOString()
  });
}

export function getDefaultSiteContentSettings() {
  return new InMemorySiteSettingsRepository().get();
}
