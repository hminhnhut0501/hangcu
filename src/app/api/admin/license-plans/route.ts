import { z } from "zod";
import { writeAuditLog } from "@/modules/audit/service";
import { requireAdminMutationAccess } from "@/modules/admin-auth/guard";
import { getAdminMutationContext } from "@/modules/admin-auth/context";
import { deleteLicensePlan, getLicensePlanById, listLicensePlans, upsertLicensePlan } from "@/modules/license-plans/service";

const schema = z.object({
  id: z.string().min(1),
  code: z.string().min(1),
  name: z.string().min(1),
  nameVi: z.string().min(1).optional(),
  nameEn: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  description: z.string().optional(),
  vndPrice: z.coerce.number().nullable().optional(),
  usdPrice: z.coerce.number().nullable().optional(),
  planType: z.enum(["regular", "donate_bonus", "special"]).optional(),
  durationDays: z.coerce.number().int().nonnegative().optional(),
  isLifetime: z.coerce.boolean().optional(),
  status: z.enum(["active", "hidden", "archived"]).optional(),
  sortOrder: z.coerce.number().int().nonnegative().optional(),
  entitlementTags: z.string().optional()
});

export async function GET() {
  const plans = await listLicensePlans();
  return Response.json({ success: true, data: plans });
}

export async function POST(request: Request) {
  try {
    await requireAdminMutationAccess("content_manager");
    const payload = await request.json().catch(() => null);
    const parsed = schema.safeParse(payload);
    if (!parsed.success) {
      return Response.json({ success: false, error: { code: "INVALID_REQUEST", message: "Request is invalid." } }, { status: 400 });
    }

    const existing = await getLicensePlanById(parsed.data.id);
    const plan = await upsertLicensePlan({
      id: parsed.data.id,
      code: parsed.data.code,
      name: parsed.data.name,
      nameVi: parsed.data.nameVi,
      nameEn: parsed.data.nameEn,
      slug: parsed.data.slug ?? existing?.slug,
      description: parsed.data.description ?? existing?.description,
      currencyPrices: {
        VND: parsed.data.vndPrice ?? null,
        USD: parsed.data.usdPrice ?? null
      },
      planType: parsed.data.planType ?? existing?.planType,
      durationDays: parsed.data.durationDays ?? existing?.durationDays,
      isLifetime: parsed.data.isLifetime ?? existing?.isLifetime,
      status: parsed.data.status ?? existing?.status,
      sortOrder: parsed.data.sortOrder ?? existing?.sortOrder,
      entitlementTags: parsed.data.entitlementTags
        ? parsed.data.entitlementTags.split(",").map((tag) => tag.trim()).filter(Boolean)
        : existing?.entitlementTags
    });
    await writeAuditLog({
      ...getAdminMutationContext(),
      action: "license_plan_upserted",
      entityType: "license_plan",
      entityId: plan.id,
      afterData: plan
    });

    return Response.json({ success: true, data: plan });
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

export async function DELETE(request: Request) {
  try {
    await requireAdminMutationAccess("content_manager");
    const payload = await request.json().catch(() => null);
    const id = typeof payload?.id === "string" ? payload.id : "";
    if (!id) {
      return Response.json({ success: false, error: { code: "INVALID_REQUEST", message: "Missing plan id." } }, { status: 400 });
    }

    const existing = await getLicensePlanById(id);
    if (!existing) {
      return Response.json({ success: false, error: { code: "NOT_FOUND", message: "License plan not found." } }, { status: 404 });
    }

    const deleted = await deleteLicensePlan(id);
    await writeAuditLog({
      ...getAdminMutationContext(),
      action: "license_plan_deleted",
      entityType: "license_plan",
      entityId: id,
      beforeData: existing
    });

    return Response.json({ success: true, data: { deleted } });
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
