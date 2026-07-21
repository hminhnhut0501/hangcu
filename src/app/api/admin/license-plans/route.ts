import { z } from "zod";
import { writeAuditLog } from "@/modules/audit/service";
import { requireAdminMutationAccess } from "@/modules/admin-auth/guard";
import { getAdminMutationContext } from "@/modules/admin-auth/context";
import { listLicensePlans, upsertLicensePlan } from "@/modules/license-plans/service";

const schema = z.object({
  id: z.string().min(1),
  code: z.string().min(1),
  name: z.string().min(1),
  nameVi: z.string().min(1).optional(),
  nameEn: z.string().min(1).optional(),
  slug: z.string().min(1),
  description: z.string(),
  vndPrice: z.coerce.number().nullable().optional(),
  usdPrice: z.coerce.number().nullable().optional(),
  planType: z.enum(["regular", "donate_bonus", "special"]),
  durationDays: z.coerce.number().int().nonnegative(),
  isLifetime: z.coerce.boolean(),
  status: z.enum(["active", "hidden", "archived"]),
  sortOrder: z.coerce.number().int().nonnegative(),
  entitlementTags: z.string().optional()
});

export async function GET() {
  const plans = await listLicensePlans();
  return Response.json({ success: true, data: plans });
}

export async function POST(request: Request) {
  await requireAdminMutationAccess("content_manager");
  const payload = await request.json().catch(() => null);
  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    return Response.json({ success: false, error: { code: "INVALID_REQUEST", message: "Request is invalid." } }, { status: 400 });
  }

  const plan = await upsertLicensePlan({
    id: parsed.data.id,
    code: parsed.data.code,
    name: parsed.data.name,
    nameVi: parsed.data.nameVi,
    nameEn: parsed.data.nameEn,
    slug: parsed.data.slug,
    description: parsed.data.description,
    currencyPrices: {
      VND: parsed.data.vndPrice ?? null,
      USD: parsed.data.usdPrice ?? null
    },
    planType: parsed.data.planType,
    durationDays: parsed.data.durationDays,
    isLifetime: parsed.data.isLifetime,
    status: parsed.data.status,
    sortOrder: parsed.data.sortOrder,
    entitlementTags: parsed.data.entitlementTags
      ? parsed.data.entitlementTags.split(",").map((tag) => tag.trim()).filter(Boolean)
      : undefined
  });
  await writeAuditLog({
    ...getAdminMutationContext(),
    action: "license_plan_upserted",
    entityType: "license_plan",
    entityId: plan.id,
    afterData: plan
  });

  return Response.json({ success: true, data: plan });
}
