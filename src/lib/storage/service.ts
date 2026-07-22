import { getSupabaseServiceClient } from "@/lib/db/supabase-server";

export function getStorageBucketName() {
  return process.env.SUPABASE_STORAGE_BUCKET ?? "site-assets";
}

function mapStorageUploadError(error: { message?: string; statusCode?: string | number; status?: number } | null, bucket: string) {
  const message = String(error?.message ?? "");
  const isMissingBucket =
    error?.status === 404 ||
    error?.statusCode === "404" ||
    message.toLowerCase().includes("bucket not found") ||
    message.toLowerCase().includes("bucket") && message.toLowerCase().includes("not found");

  if (isMissingBucket) {
    return new Error(
      `Supabase Storage bucket "${bucket}" chưa tồn tại. Hãy tạo bucket này trong Supabase Storage hoặc set SUPABASE_STORAGE_BUCKET cho đúng tên bucket.`
    );
  }

  return null;
}

export function isStorageBucketMissingError(error: unknown) {
  const message = error instanceof Error ? error.message : String((error as { message?: string } | null)?.message ?? error ?? "");
  return (
    message.includes("chưa tồn tại") ||
    message.toLowerCase().includes("bucket not found") ||
    message.includes("SUPABASE_STORAGE_BUCKET")
  );
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
  if (error) {
    throw mapStorageUploadError(error, bucket) ?? error;
  }

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
