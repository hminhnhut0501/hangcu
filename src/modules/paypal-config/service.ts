import { getSupabaseServiceClient } from "@/lib/db/supabase-server";

export type PayPalConfig = {
  clientId: string;
  clientSecret: string;
  webhookId: string;
  environment: "sandbox" | "live";
};

export async function getPayPalConfig(): Promise<PayPalConfig> {
  const fallback: PayPalConfig = {
    clientId: process.env.PAYPAL_CLIENT_ID?.trim() ?? "",
    clientSecret: process.env.PAYPAL_CLIENT_SECRET?.trim() ?? "",
    webhookId: process.env.PAYPAL_WEBHOOK_ID?.trim() ?? "",
    environment: process.env.PAYPAL_ENV === "live" ? "live" : "sandbox"
  };
  const client = getSupabaseServiceClient();
  if (!client) return fallback;
  const { data, error } = await client.from("paypal_config").select("*").eq("id", "global").maybeSingle();
  if (error || !data) return fallback;
  return {
    clientId: String(data.client_id || fallback.clientId),
    clientSecret: String(data.client_secret || fallback.clientSecret),
    webhookId: String(data.webhook_id || fallback.webhookId),
    environment: data.environment === "live" ? "live" : "sandbox"
  };
}

export function maskPayPalSecret(value: string) {
  const normalized = String(value || "");
  return normalized ? `${normalized.slice(0, 4)}${"*".repeat(Math.max(4, normalized.length - 8))}${normalized.slice(-4)}` : "";
}
