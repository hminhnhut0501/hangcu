import { getSupabaseServiceClient } from "@/lib/db/supabase-server";

export function getStorageBucketName() {
  return process.env.SUPABASE_STORAGE_BUCKET ?? "site-assets";
}

export async function uploadStorageFile(input: {
  path: string;
  file: File;
}) {
  const client = getSupabaseServiceClient();
  if (!client) {
    throw new Error("Supabase storage is not configured.");
  }

  const bucket = getStorageBucketName();
  const { error } = await client.storage.from(bucket).upload(input.path, input.file, {
    upsert: true,
    contentType: input.file.type || "application/octet-stream"
  });
  if (error) throw error;

  const { data } = client.storage.from(bucket).getPublicUrl(input.path);
  return {
    bucket,
    path: input.path,
    publicUrl: data.publicUrl
  };
}

export async function getStoragePublicUrl(path: string) {
  const client = getSupabaseServiceClient();
  if (!client) {
    return null;
  }

  const bucket = getStorageBucketName();
  const { data } = client.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}
