import { z } from "zod";
import { writeAuditLog } from "@/modules/audit/service";
import { requireAdminMutationAccess } from "@/modules/admin-auth/guard";
import { getAdminMutationContext } from "@/modules/admin-auth/context";
import { createLicenseKey, listLicenseKeys } from "@/modules/license-keys/service";

const schema = z.object({
  licensePlanId: z.string().min(1),
  orderId: z.string().min(1),
  orderItemId: z.string().min(1),
  code: z.string().min(1),
  expiresAt: z.string().nullable().optional()
});

export async function GET() {
  const keys = await listLicenseKeys();
  return Response.json({ success: true, data: keys });
}

export async function POST(request: Request) {
  await requireAdminMutationAccess("admin");
  const payload = await request.json().catch(() => null);
  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    return Response.json({ success: false, error: { code: "INVALID_REQUEST", message: "Request is invalid." } }, { status: 400 });
  }

  const key = await createLicenseKey({
    licensePlanId: parsed.data.licensePlanId,
    orderId: parsed.data.orderId,
    orderItemId: parsed.data.orderItemId,
    code: parsed.data.code,
    expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : null
  });

  await writeAuditLog({
    ...getAdminMutationContext(),
    action: "license_key_created",
    entityType: "license_key",
    entityId: key.id,
    afterData: key
  });

  return Response.json({ success: true, data: key });
}
