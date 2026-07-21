import { z } from "zod";
import { writeAuditLog } from "@/modules/audit/service";
import { updateProductStatus } from "@/modules/products/service";
import { requireAdminMutationAccess } from "@/modules/admin-auth/guard";
import { getAdminMutationContext } from "@/modules/admin-auth/context";

const schema = z.object({
  productId: z.string().min(1),
  status: z.enum(["draft", "active", "hidden", "archived"])
});

export async function POST(request: Request) {
  await requireAdminMutationAccess("content_manager");
  const payload = await request.json().catch(() => null);
  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    return Response.json({ success: false, error: { code: "INVALID_REQUEST", message: "Request is invalid." } }, { status: 400 });
  }

  const product = await updateProductStatus(parsed.data.productId, parsed.data.status);
  await writeAuditLog({
    ...getAdminMutationContext(),
    action: "product_status_changed",
    entityType: "product",
    entityId: product.id,
    afterData: product
  });

  return Response.json({ success: true, data: product });
}
