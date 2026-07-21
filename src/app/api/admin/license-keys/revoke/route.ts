import { z } from "zod";
import { writeAuditLog } from "@/modules/audit/service";
import { requireAdminMutationAccess } from "@/modules/admin-auth/guard";
import { getAdminMutationContext } from "@/modules/admin-auth/context";
import { revokeLicenseKey } from "@/modules/license-keys/service";

const schema = z.object({
  code: z.string().min(1),
  reason: z.string().min(1)
});

export async function POST(request: Request) {
  await requireAdminMutationAccess("admin");
  const payload = await request.json().catch(() => null);
  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    return Response.json({ success: false, error: { code: "INVALID_REQUEST", message: "Request is invalid." } }, { status: 400 });
  }

  const key = await revokeLicenseKey(parsed.data);
  await writeAuditLog({
    ...getAdminMutationContext(),
    action: "license_key_revoked",
    entityType: "license_key",
    entityId: key.id,
    afterData: key
  });

  return Response.json({ success: true, data: key });
}
