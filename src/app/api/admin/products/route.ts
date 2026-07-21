import { z } from "zod";
import { writeAuditLog } from "@/modules/audit/service";
import { upsertProduct } from "@/modules/products/service";
import { requireAdminMutationAccess } from "@/modules/admin-auth/guard";
import { getAdminMutationContext } from "@/modules/admin-auth/context";

const productSchema = z.object({
  id: z.string().min(1),
  sku: z.string().min(1),
  name: z.string().min(1),
  slug: z.string().min(1),
  shortDescription: z.string(),
  description: z.string(),
  status: z.enum(["draft", "active", "hidden", "archived"]),
  collectionId: z.string().nullable(),
  featured: z.boolean(),
  downloadLimit: z.number().int().positive(),
  downloadExpiryDays: z.number().int().positive(),
  currency: z.string().length(3),
  amountMinor: z.number().int().nonnegative(),
  compareAtAmountMinor: z.number().int().nonnegative().nullable(),
  media: z.array(z.object({
    id: z.string(),
    type: z.enum(["preview", "detail", "lifestyle"]),
    storagePath: z.string(),
    altText: z.string(),
    sortOrder: z.number().int().nonnegative(),
    width: z.number().int().positive(),
    height: z.number().int().positive()
  }))
});

export async function POST(request: Request) {
  await requireAdminMutationAccess("content_manager");
  const payload = await request.json().catch(() => null);
  const parsed = productSchema.safeParse(payload);
  if (!parsed.success) {
    return Response.json({ success: false, error: { code: "INVALID_REQUEST", message: "Request is invalid." } }, { status: 400 });
  }

  const product = await upsertProduct({
    ...parsed.data,
    media: parsed.data.media.map((media) => ({
      ...media,
      bucketName: "product-media",
      publicUrl: null
    }))
  });
  await writeAuditLog({
    ...getAdminMutationContext(),
    action: "product_upserted",
    entityType: "product",
    entityId: product.id,
    afterData: product
  });

  return Response.json({ success: true, data: product });
}
