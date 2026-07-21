import { z } from "zod";
import { requireAdminMutationAccess } from "@/modules/admin-auth/guard";
import { getSupabaseServiceClient } from "@/lib/db/supabase-server";
import { uploadStorageFile } from "@/lib/storage/service";
import { getProductBySlug } from "@/modules/products/service";

const schema = z.object({
  productSlug: z.string().min(1),
  mediaType: z.enum(["preview", "detail", "lifestyle"]),
  altText: z.string().min(1),
  sortOrder: z.coerce.number().int().nonnegative().default(0)
});

export async function GET(request: Request) {
  const url = new URL(request.url);
  const productSlug = url.searchParams.get("productSlug");
  if (!productSlug) {
    return Response.json({ success: false, error: { code: "INVALID_REQUEST", message: "Missing productSlug." } }, { status: 400 });
  }

  const product = await getProductBySlug(productSlug);
  return Response.json({ success: true, data: product.media });
}

export async function POST(request: Request) {
  await requireAdminMutationAccess("content_manager");
  const formData = await request.formData();
  const file = formData.get("file");
  const parsed = schema.safeParse({
    productSlug: formData.get("productSlug"),
    mediaType: formData.get("mediaType"),
    altText: formData.get("altText"),
    sortOrder: formData.get("sortOrder")
  });

  if (!parsed.success || !(file instanceof File)) {
    return Response.json({ success: false, error: { code: "INVALID_REQUEST", message: "Request is invalid." } }, { status: 400 });
  }

  const product = await getProductBySlug(parsed.data.productSlug);
  const extension = file.name.split(".").pop() || "bin";
  const path = `products/${product.slug}/${parsed.data.mediaType}-${Date.now()}.${extension}`;
  const uploaded = await uploadStorageFile({ path, file });

  const nextMedia = [
    ...product.media,
    {
      id: `media_${Date.now()}`,
      type: parsed.data.mediaType,
      bucketName: uploaded.bucket,
      storagePath: uploaded.path,
      publicUrl: uploaded.publicUrl,
      altText: parsed.data.altText,
      sortOrder: parsed.data.sortOrder,
      width: 1600,
      height: 2000
    }
  ];

  const client = getSupabaseServiceClient();
  if (client) {
    await client.from("product_media").delete().eq("product_id", product.id);
    const { error } = await client.from("product_media").insert(
      nextMedia.map((media) => ({
        id: media.id,
        product_id: product.id,
        type: media.type,
        bucket_name: media.bucketName,
        storage_path: media.storagePath,
        public_url: media.publicUrl,
        alt_text: media.altText,
        sort_order: media.sortOrder,
        width: media.width,
        height: media.height
      }))
    );
    if (error) throw error;
  }

  return Response.json({ success: true, data: { productId: product.id, media: nextMedia } });
}

export async function PATCH(request: Request) {
  await requireAdminMutationAccess("content_manager");
  const payload = await request.json().catch(() => null);
  const parsed = z.object({
    productSlug: z.string().min(1),
    mediaId: z.string().min(1),
    altText: z.string().optional(),
    sortOrder: z.coerce.number().int().optional()
  }).safeParse(payload);

  if (!parsed.success) {
    return Response.json({ success: false, error: { code: "INVALID_REQUEST", message: "Request is invalid." } }, { status: 400 });
  }

  const product = await getProductBySlug(parsed.data.productSlug);
  const nextMedia = product.media.map((media) =>
    media.id === parsed.data.mediaId
      ? {
          ...media,
          altText: parsed.data.altText ?? media.altText,
          sortOrder: parsed.data.sortOrder ?? media.sortOrder
        }
      : media
  );

  const client = getSupabaseServiceClient();
  if (client) {
    await client.from("product_media").delete().eq("product_id", product.id);
    const { error } = await client.from("product_media").insert(
      nextMedia.map((media) => ({
        id: media.id,
        product_id: product.id,
        type: media.type,
        bucket_name: media.bucketName,
        storage_path: media.storagePath,
        public_url: media.publicUrl,
        alt_text: media.altText,
        sort_order: media.sortOrder,
        width: media.width,
        height: media.height
      }))
    );
    if (error) throw error;
  }

  return Response.json({ success: true, data: nextMedia });
}

export async function DELETE(request: Request) {
  await requireAdminMutationAccess("content_manager");
  const url = new URL(request.url);
  const productSlug = url.searchParams.get("productSlug");
  const mediaId = url.searchParams.get("mediaId");
  if (!productSlug || !mediaId) {
    return Response.json({ success: false, error: { code: "INVALID_REQUEST", message: "Missing productSlug or mediaId." } }, { status: 400 });
  }

  const product = await getProductBySlug(productSlug);
  const nextMedia = product.media.filter((media) => media.id !== mediaId);

  const client = getSupabaseServiceClient();
  if (client) {
    await client.from("product_media").delete().eq("product_id", product.id);
    const { error } = await client.from("product_media").insert(
      nextMedia.map((media) => ({
        id: media.id,
        product_id: product.id,
        type: media.type,
        bucket_name: media.bucketName,
        storage_path: media.storagePath,
        public_url: media.publicUrl,
        alt_text: media.altText,
        sort_order: media.sortOrder,
        width: media.width,
        height: media.height
      }))
    );
    if (error) throw error;
  }

  return Response.json({ success: true, data: nextMedia });
}
