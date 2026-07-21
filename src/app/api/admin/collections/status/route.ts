import { z } from "zod";
import { writeAuditLog } from "@/modules/audit/service";
import { updateCollectionStatus } from "@/modules/collections/service";
import { requireAdminMutationAccess } from "@/modules/admin-auth/guard";
import { getAdminMutationContext } from "@/modules/admin-auth/context";

const schema = z.object({
  collectionId: z.string().min(1),
  status: z.enum(["active", "hidden", "archived"])
});

export async function POST(request: Request) {
  await requireAdminMutationAccess("content_manager");
  const payload = await request.json().catch(() => null);
  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    return Response.json({ success: false, error: { code: "INVALID_REQUEST", message: "Request is invalid." } }, { status: 400 });
  }

  const collection = await updateCollectionStatus(parsed.data.collectionId, parsed.data.status);
  await writeAuditLog({
    ...getAdminMutationContext(),
    action: "collection_status_changed",
    entityType: "collection",
    entityId: collection.id,
    afterData: collection
  });

  return Response.json({ success: true, data: collection });
}
