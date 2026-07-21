import { z } from "zod";
import { writeAuditLog } from "@/modules/audit/service";
import { redeemCoupon, listCoupons, upsertCoupon } from "@/modules/coupons/service";
import { getSupabaseServiceClient } from "@/lib/db/supabase-server";
import { requireAdminMutationAccess } from "@/modules/admin-auth/guard";
import { getAdminMutationContext } from "@/modules/admin-auth/context";

const couponUpsertSchema = z.object({
  id: z.string().min(1),
  code: z.string().min(1),
  type: z.enum(["percent", "fixed"]),
  value: z.number().nonnegative(),
  currency: z.string().nullable().optional(),
  minOrderMinor: z.number().int().nonnegative(),
  maxRedemptions: z.number().int().positive(),
  redemptionCount: z.number().int().nonnegative(),
  status: z.enum(["active", "inactive", "archived"])
});

export async function GET() {
  const coupons = await listCoupons();
  return Response.json({ success: true, data: coupons });
}

export async function POST(request: Request) {
  await requireAdminMutationAccess("admin");
  const payload = await request.json().catch(() => null);
  const parsed = couponUpsertSchema.safeParse(payload);
  if (!parsed.success) {
    return Response.json({ success: false, error: { code: "INVALID_REQUEST", message: "Request is invalid." } }, { status: 400 });
  }

  await upsertCoupon(parsed.data);

  await writeAuditLog({
    ...getAdminMutationContext(),
    action: "coupon_upserted",
    entityType: "coupon",
    entityId: parsed.data.id,
    afterData: parsed.data
  });

  return Response.json({ success: true, data: parsed.data });
}

export async function PATCH(request: Request) {
  await requireAdminMutationAccess("admin");
  const body = await request.json().catch(() => null);
  const schema = z.object({
    code: z.string().min(1)
  });
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ success: false, error: { code: "INVALID_REQUEST", message: "Request is invalid." } }, { status: 400 });
  }

  const coupon = await redeemCoupon(parsed.data.code);
  await writeAuditLog({
    ...getAdminMutationContext(),
    action: "coupon_redeemed_manually",
    entityType: "coupon",
    entityId: coupon.id,
    afterData: coupon
  });

  return Response.json({ success: true, data: coupon });
}
