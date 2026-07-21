import { z } from "zod";
import { writeAuditLog } from "@/modules/audit/service";
import { requireAdminMutationAccess } from "@/modules/admin-auth/guard";
import { getAdminMutationContext } from "@/modules/admin-auth/context";
import { listLicenseKeys, updateLicenseKeyById } from "@/modules/license-keys/service";

const bulkSchema = z.object({
  ids: z.array(z.string().min(1)).min(1),
  status: z.enum(["available", "reserved", "issued", "redeemed", "expired", "revoked"]),
  reason: z.string().nullable().optional()
});

export async function PATCH(request: Request) {
  await requireAdminMutationAccess("admin");
  const payload = await request.json().catch(() => null);
  const parsed = bulkSchema.safeParse(payload);
  if (!parsed.success) {
    return Response.json(
      { success: false, error: { code: "INVALID_REQUEST", message: "Request is invalid." } },
      { status: 400 }
    );
  }

  const keys = await listLicenseKeys();
  const targets = keys.filter((key) => parsed.data.ids.includes(key.id));
  if (targets.length === 0) {
    return Response.json(
      { success: false, error: { code: "NOT_FOUND", message: "No matching license keys found." } },
      { status: 404 }
    );
  }

  const updated = [];
  for (const key of targets) {
    const result = await updateLicenseKeyById({
      id: key.id,
      status: parsed.data.status,
      revokedReason: parsed.data.status === "revoked" ? parsed.data.reason ?? "Bulk action" : undefined,
      expiresAt: parsed.data.status === "expired" ? new Date() : undefined
    });
    updated.push(result);
    await writeAuditLog({
      ...getAdminMutationContext(),
      action: "license_key_bulk_updated",
      entityType: "license_key",
      entityId: result.id,
      afterData: result
    });
  }

  return Response.json({ success: true, data: updated });
}
