import { cookies } from "next/headers";

export type StorefrontLocale = "vi" | "en";

export async function getStorefrontLocale(): Promise<StorefrontLocale> {
  const cookieStore = await cookies();
  const value = cookieStore.get("lang")?.value;
  return value === "vi" || value === "en" ? value : "en";
}

export function getLocalizedText(locale: StorefrontLocale, input: { vi: string; en: string }) {
  return locale === "vi" ? input.vi : input.en;
}
