import { z } from "zod";
import { writeAuditLog } from "@/modules/audit/service";
import { upsertCollection } from "@/modules/collections/service";
import { requireAdminMutationAccess } from "@/modules/admin-auth/guard";
import { getAdminMutationContext } from "@/modules/admin-auth/context";

const collectionSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string(),
  status: z.enum(["active", "hidden", "archived"]),
  sortOrder: z.number().int().nonnegative()
});

export async function POST(request: Request) {
  await requireAdminMutationAccess("content_manager");
  const payload = await request.json().catch(() => null);
  const parsed = collectionSchema.safeParse(payload);
  if (!parsed.success) {
    return Response.json({ success: false, error: { code: "INVALID_REQUEST", message: "Request is invalid." } }, { status: 400 });
  }

  const collection = await upsertCollection(parsed.data);
  await writeAuditLog({
    ...getAdminMutationContext(),
    action: "collection_upserted",
    entityType: "collection",
    entityId: collection.id,
    afterData: collection
  });

  return Response.json({ success: true, data: collection });
}
