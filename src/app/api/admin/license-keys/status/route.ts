import { z } from "zod";
import { writeAuditLog } from "@/modules/audit/service";
import { requireAdminMutationAccess } from "@/modules/admin-auth/guard";
import { getAdminMutationContext } from "@/modules/admin-auth/context";
import { updateLicenseKeyById } from "@/modules/license-keys/service";

const schema = z.object({
  id: z.string().min(1),
  status: z.enum(["available", "reserved", "issued", "redeemed", "expired", "revoked"]),
  expiresAt: z.string().nullable().optional(),
  revokedReason: z.string().nullable().optional(),
  customerRef: z.string().nullable().optional(),
  externalUserId: z.string().nullable().optional(),
  notes: z.string().nullable().optional()
});

export async function PATCH(request: Request) {
  await requireAdminMutationAccess("admin");
  const payload = await request.json().catch(() => null);
  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    return Response.json(
      { success: false, error: { code: "INVALID_REQUEST", message: "Request is invalid." } },
      { status: 400 }
    );
  }

  const key = await updateLicenseKeyById({
    id: parsed.data.id,
    status: parsed.data.status,
    expiresAt: parsed.data.expiresAt === undefined ? undefined : parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : null,
    revokedReason: parsed.data.revokedReason,
    customerRef: parsed.data.customerRef,
    externalUserId: parsed.data.externalUserId,
    notes: parsed.data.notes
  });

  await writeAuditLog({
    ...getAdminMutationContext(),
    action: "license_key_status_updated",
    entityType: "license_key",
    entityId: key.id,
    afterData: key
  });

  return Response.json({ success: true, data: key });
}
