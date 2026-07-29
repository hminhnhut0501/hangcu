import { z } from "zod";
import { requireAdminMutationAccess } from "@/modules/admin-auth/guard";
import { getSupabaseServiceClient } from "@/lib/db/supabase-server";
import { getPayPalConfig, maskPayPalSecret } from "@/modules/paypal-config/service";

const schema = z.object({
  clientId: z.string().optional(),
  clientSecret: z.string().optional(),
  webhookId: z.string().optional(),
  environment: z.enum(["sandbox", "live"])
});

function responseData(config: Awaited<ReturnType<typeof getPayPalConfig>>) {
  return {
    clientIdMasked: maskPayPalSecret(config.clientId),
    clientSecretMasked: maskPayPalSecret(config.clientSecret),
    webhookIdMasked: maskPayPalSecret(config.webhookId),
    configured: Boolean(config.clientId && config.clientSecret && config.webhookId),
    environment: config.environment
  };
}

export async function GET() {
  return Response.json({ success: true, data: responseData(await getPayPalConfig()) });
}

export async function POST(request: Request) {
  await requireAdminMutationAccess("admin");
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ success: false, error: { code: "INVALID_REQUEST", message: "Request is invalid." } }, { status: 400 });
  const client = getSupabaseServiceClient();
  if (!client) return Response.json({ success: false, error: { code: "DB_UNAVAILABLE", message: "Supabase is not configured." } }, { status: 503 });
  const current = await getPayPalConfig();
  const { error } = await client.from("paypal_config").upsert({
    id: "global",
    client_id: parsed.data.clientId?.trim() || current.clientId,
    client_secret: parsed.data.clientSecret?.trim() || current.clientSecret,
    webhook_id: parsed.data.webhookId?.trim() || current.webhookId,
    environment: parsed.data.environment,
    updated_at: new Date().toISOString()
  });
  if (error) return Response.json({ success: false, error: { code: "DB_WRITE_FAILED", message: error.message } }, { status: 500 });
  return Response.json({ success: true, data: responseData(await getPayPalConfig()) });
}
