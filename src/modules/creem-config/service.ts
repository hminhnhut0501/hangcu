import { getSupabaseServiceClient } from "@/lib/db/supabase-server";

export type CreemProductMapping = { planCode: string; productId: string; enabled: boolean };
export type CreemConfig = {
  apiKey: string;
  webhookSecret: string;
  server: "test" | "prod";
  productMappings: CreemProductMapping[];
};

function envMappings(): CreemProductMapping[] {
  return [
    ["FULL_1M", "CREEM_PRODUCT_ID_FULL_1M"],
    ["FULL_LIFE", "CREEM_PRODUCT_ID_FULL_LIFE"],
    ["SUPPORT_30", "CREEM_PRODUCT_ID_SUPPORT_30"],
    ["SUPPORT_PLUS", "CREEM_PRODUCT_ID_SUPPORT_PLUS"],
    ["SUPPORT_LIFE", "CREEM_PRODUCT_ID_SUPPORT_LIFE"]
  ].map(([planCode, key]) => ({ planCode, productId: process.env[key]?.trim() ?? "", enabled: true })).filter((item) => item.productId);
}

export async function getCreemConfig(): Promise<CreemConfig> {
  const fallback: CreemConfig = {
    apiKey: process.env.CREEM_API_KEY?.trim() ?? "",
    webhookSecret: process.env.CREEM_WEBHOOK_SECRET?.trim() ?? "",
    server: process.env.CREEM_SERVER === "prod" || process.env.NODE_ENV === "production" ? "prod" : "test",
    productMappings: envMappings()
  };
  const client = getSupabaseServiceClient();
  if (!client) return fallback;
  const { data, error } = await client.from("creem_config").select("*").eq("id", "global").maybeSingle();
  if (error || !data) return fallback;
  return {
    apiKey: String(data.api_key || fallback.apiKey),
    webhookSecret: String(data.webhook_secret || fallback.webhookSecret),
    server: data.server === "prod" ? "prod" : "test",
    productMappings: Array.isArray(data.product_mappings) ? data.product_mappings as CreemProductMapping[] : fallback.productMappings
  };
}

export async function resolveCreemProductIdFromConfig(planCode?: string | null) {
  const normalized = String(planCode ?? "").trim().toUpperCase();
  const config = await getCreemConfig();
  const canonical = normalized.replace(/^G\d+:(1M|LIFE)$/, (_, duration: string) => duration === "1M" ? "FULL_1M" : "FULL_LIFE");
  return config.productMappings.find((item) => item.enabled && item.planCode.toUpperCase() === normalized)?.productId ||
    config.productMappings.find((item) => item.enabled && item.planCode.toUpperCase() === canonical)?.productId ||
    process.env.CREEM_PRODUCT_ID_DEFAULT?.trim() || "";
}

export function maskSecret(value: string) {
  const normalized = String(value || "");
  return normalized ? `${normalized.slice(0, 4)}${"*".repeat(Math.max(4, normalized.length - 8))}${normalized.slice(-4)}` : "";
}
