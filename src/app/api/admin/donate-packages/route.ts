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
  suggestedAmountMinor: z.coerce.number().int().nonnegative().nullable().optional(),
  currency: z.string().nullable(),
  vndPrice: z.coerce.number().int().nonnegative().nullable().optional(),
  usdPrice: z.coerce.number().nonnegative().nullable().optional(),
  status: z.enum(["active", "hidden", "archived"])
});

export async function GET() {
  const packages = await listDonatePackages();
  return Response.json({ success: true, data: packages });
}

export async function POST(request: Request) {
  try {
    await requireAdminMutationAccess("content_manager");
    const payload = await request.json().catch(() => null);
    const parsed = schema.safeParse(payload);
    if (!parsed.success) {
      return Response.json({ success: false, error: { code: "INVALID_REQUEST", message: "Request is invalid." } }, { status: 400 });
    }

    const pkg = await upsertDonatePackage({
      ...parsed.data,
      suggestedAmountMinor: parsed.data.suggestedAmountMinor ?? null
    });
    await writeAuditLog({
      ...getAdminMutationContext(),
      action: "donate_package_upserted",
      entityType: "donate_package",
      entityId: pkg.id,
      afterData: pkg
    });

    return Response.json({ success: true, data: pkg });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const isPersistenceError = message.startsWith("PERSISTENCE_UNAVAILABLE:");
    return Response.json(
      {
        success: false,
        error: {
          code: isPersistenceError ? "PERSISTENCE_UNAVAILABLE" : "INTERNAL_ERROR",
          message: isPersistenceError ? message.replace(/^PERSISTENCE_UNAVAILABLE:\s*/, "") : message
        }
      },
      { status: isPersistenceError ? 503 : 500 }
    );
  }
}
