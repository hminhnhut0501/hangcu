import { z } from "zod";
import { requireAdminMutationAccess } from "@/modules/admin-auth/guard";
import { getSupabaseServiceClient } from "@/lib/db/supabase-server";
import { getCreemConfig, maskSecret } from "@/modules/creem-config/service";

const mappingSchema = z.object({
  planCode: z.string().trim().min(1),
  productId: z.string().trim().min(1),
  enabled: z.boolean()
});
const schema = z.object({
  apiKey: z.string().optional(),
  webhookSecret: z.string().optional(),
  server: z.enum(["test", "prod"]),
  productMappings: z.array(mappingSchema)
});

export async function GET() {
  const config = await getCreemConfig();
  return Response.json({ success: true, data: { apiKey: maskSecret(config.apiKey), webhookSecret: maskSecret(config.webhookSecret), configured: Boolean(config.apiKey && config.webhookSecret), server: config.server, productMappings: config.productMappings } });
}

export async function POST(request: Request) {
  await requireAdminMutationAccess("admin");
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ success: false, error: { code: "INVALID_REQUEST", message: "Request is invalid." } }, { status: 400 });

  const normalizedMappings = parsed.data.productMappings.map((mapping) => ({
    ...mapping,
    planCode: mapping.planCode.trim().toUpperCase(),
    productId: mapping.productId.trim()
  }));
  const planCodes = new Set<string>();
  const productIds = new Set<string>();
  for (const mapping of normalizedMappings) {
    if (planCodes.has(mapping.planCode)) {
      return Response.json({ success: false, error: { code: "DUPLICATE_PLAN_MAPPING", message: `Plan ${mapping.planCode} is mapped more than once.` } }, { status: 400 });
    }
    if (productIds.has(mapping.productId)) {
      return Response.json({ success: false, error: { code: "DUPLICATE_PRODUCT_MAPPING", message: `Creem product ${mapping.productId} is mapped more than once.` } }, { status: 400 });
    }
    planCodes.add(mapping.planCode);
    productIds.add(mapping.productId);
  }
  const client = getSupabaseServiceClient();
  if (!client) return Response.json({ success: false, error: { code: "DB_UNAVAILABLE", message: "Supabase is not configured." } }, { status: 503 });
  const current = await getCreemConfig();
  const { error } = await client.from("creem_config").upsert({
    id: "global",
    api_key: parsed.data.apiKey?.trim() || current.apiKey,
    webhook_secret: parsed.data.webhookSecret?.trim() || current.webhookSecret,
    server: parsed.data.server,
    product_mappings: normalizedMappings,
    updated_at: new Date().toISOString()
  });
  if (error) return Response.json({ success: false, error: { code: "DB_WRITE_FAILED", message: error.message } }, { status: 500 });
  const saved = await getCreemConfig();
  return Response.json({ success: true, data: { apiKey: maskSecret(saved.apiKey), webhookSecret: maskSecret(saved.webhookSecret), configured: Boolean(saved.apiKey && saved.webhookSecret), server: saved.server, productMappings: saved.productMappings } });
}
