import { InMemorySiteSettingsRepository, SupabaseSiteSettingsRepository } from "./repository";
import type { SiteContentSettings, SitePaymentGateway } from "./types";

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

function getGatewayPreferenceOrder(currency: "VND" | "USD") {
  return currency === "USD"
    ? (["creem", "paypal", "lemonsqueezy", "manual", "sandbox"] as const)
    : (["payos", "manual", "sandbox"] as const);
}

export function resolvePreferredPaymentGateway(
  settings: SiteContentSettings,
  currency: "VND" | "USD"
): SitePaymentGateway | null {
  const candidates = settings.paymentGateways.filter((gateway) => gateway.visible && gateway.currencies.includes(currency));
  for (const provider of getGatewayPreferenceOrder(currency)) {
    const match = candidates.find((gateway) => gateway.provider === provider);
    if (match) {
      return match;
    }
  }
  return candidates[0] ?? null;
}

export async function getPreferredPaymentGateway(currency: "VND" | "USD") {
  const settings = await getSiteContentSettings();
  return resolvePreferredPaymentGateway(settings, currency);
}
