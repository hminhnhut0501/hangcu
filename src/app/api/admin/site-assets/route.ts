import { z } from "zod";
import { requireAdminMutationAccess } from "@/modules/admin-auth/guard";
import { getSupabaseServiceClient } from "@/lib/db/supabase-server";
import { uploadStorageFile } from "@/lib/storage/service";
import { listSiteAssets } from "@/modules/site-assets/service";

const schema = z.object({
  assetKey: z.string().min(1),
  category: z.enum(["hero", "logo", "banner", "favicon", "misc"]),
  altTextVi: z.string().optional().nullable(),
  altTextEn: z.string().optional().nullable(),
  sortOrder: z.coerce.number().int().optional().default(0)
});

export async function GET() {
  const assets = await listSiteAssets();
  return Response.json({ success: true, data: assets });
}

export async function POST(request: Request) {
  await requireAdminMutationAccess("content_manager");
  const formData = await request.formData();
  const file = formData.get("file");
  const parsed = schema.safeParse({
    assetKey: formData.get("assetKey"),
    category: formData.get("category"),
    altTextVi: formData.get("altTextVi"),
    altTextEn: formData.get("altTextEn"),
    sortOrder: formData.get("sortOrder")
  });

  if (!parsed.success || !(file instanceof File)) {
    return Response.json({ success: false, error: { code: "INVALID_REQUEST", message: "Request is invalid." } }, { status: 400 });
  }

  const extension = file.name.split(".").pop() || "bin";
  const path = `site/${parsed.data.category}/${parsed.data.assetKey}.${extension}`;
  const uploaded = await uploadStorageFile({ path, file });
  const client = getSupabaseServiceClient();
  if (client) {
    const { error } = await client.from("site_assets").upsert({
      asset_key: parsed.data.assetKey,
      category: parsed.data.category,
      storage_path: uploaded.path,
      public_url: uploaded.publicUrl,
      alt_text_vi: parsed.data.altTextVi ?? null,
      alt_text_en: parsed.data.altTextEn ?? null,
      mime_type: file.type || null,
      sort_order: parsed.data.sortOrder,
      is_active: true,
      updated_at: new Date().toISOString()
    }, { onConflict: "asset_key" });
    if (error) throw error;
  }

  return Response.json({ success: true, data: uploaded });
}

export async function PATCH(request: Request) {
  await requireAdminMutationAccess("content_manager");
  const payload = await request.json().catch(() => null);
  const parsed = z.object({
    assetKey: z.string().min(1),
    category: z.enum(["hero", "logo", "banner", "favicon", "misc"]).optional(),
    altTextVi: z.string().nullable().optional(),
    altTextEn: z.string().nullable().optional(),
    sortOrder: z.coerce.number().int().optional(),
    isActive: z.coerce.boolean().optional()
  }).safeParse(payload);

  if (!parsed.success) {
    return Response.json({ success: false, error: { code: "INVALID_REQUEST", message: "Request is invalid." } }, { status: 400 });
  }

  const client = getSupabaseServiceClient();
  if (!client) {
    return Response.json({ success: false, error: { code: "PERSISTENCE_UNAVAILABLE", message: "Storage unavailable." } }, { status: 503 });
  }

  const { data, error } = await client
    .from("site_assets")
    .update({
      ...(parsed.data.category ? { category: parsed.data.category } : {}),
      ...(parsed.data.altTextVi !== undefined ? { alt_text_vi: parsed.data.altTextVi } : {}),
      ...(parsed.data.altTextEn !== undefined ? { alt_text_en: parsed.data.altTextEn } : {}),
      ...(parsed.data.sortOrder !== undefined ? { sort_order: parsed.data.sortOrder } : {}),
      ...(parsed.data.isActive !== undefined ? { is_active: parsed.data.isActive } : {}),
      updated_at: new Date().toISOString()
    })
    .eq("asset_key", parsed.data.assetKey)
    .select("*")
    .maybeSingle();

  if (error) throw error;
  return Response.json({ success: true, data });
}

export async function DELETE(request: Request) {
  await requireAdminMutationAccess("content_manager");
  const url = new URL(request.url);
  const assetKey = url.searchParams.get("assetKey");
  if (!assetKey) {
    return Response.json({ success: false, error: { code: "INVALID_REQUEST", message: "Missing assetKey." } }, { status: 400 });
  }

  const client = getSupabaseServiceClient();
  if (!client) {
    return Response.json({ success: false, error: { code: "PERSISTENCE_UNAVAILABLE", message: "Storage unavailable." } }, { status: 503 });
  }

  const { error } = await client.from("site_assets").delete().eq("asset_key", assetKey);
  if (error) throw error;

  return Response.json({ success: true });
}
