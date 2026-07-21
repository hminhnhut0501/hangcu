import { z } from "zod";
import { writeAuditLog } from "@/modules/audit/service";
import { requireAdminMutationAccess } from "@/modules/admin-auth/guard";
import { getAdminMutationContext } from "@/modules/admin-auth/context";
import { listDonatePackages, upsertDonatePackage } from "@/modules/donate-packages/service";

const schema = z.object({
  id: z.string().min(1),
  code: z.string().min(1),
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string(),
  suggestedAmountMinor: z.coerce.number().int().nonnegative().nullable(),
  currency: z.string().nullable(),
  status: z.enum(["active", "hidden", "archived"])
});

export async function GET() {
  const packages = await listDonatePackages();
  return Response.json({ success: true, data: packages });
}

export async function POST(request: Request) {
  await requireAdminMutationAccess("content_manager");
  const payload = await request.json().catch(() => null);
  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    return Response.json({ success: false, error: { code: "INVALID_REQUEST", message: "Request is invalid." } }, { status: 400 });
  }

  const pkg = await upsertDonatePackage(parsed.data);
  await writeAuditLog({
    ...getAdminMutationContext(),
    action: "donate_package_upserted",
    entityType: "donate_package",
    entityId: pkg.id,
    afterData: pkg
  });

  return Response.json({ success: true, data: pkg });
}
