import { getSupabaseServiceClient } from "@/lib/db/supabase-server";
import type { SiteAsset } from "./types";

const memory: SiteAsset[] = [];

export async function listSiteAssets() {
  const client = getSupabaseServiceClient();
  if (!client) return [...memory];
  const { data, error } = await client.from("site_assets").select("*").order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id,
    assetKey: row.asset_key,
    category: row.category,
    storagePath: row.storage_path,
    publicUrl: row.public_url ?? null,
    altTextVi: row.alt_text_vi ?? null,
    altTextEn: row.alt_text_en ?? null,
    mimeType: row.mime_type ?? null,
    width: row.width ?? null,
    height: row.height ?? null,
    sortOrder: row.sort_order,
    isActive: row.is_active,
    updatedAt: row.updated_at
  }));
}
