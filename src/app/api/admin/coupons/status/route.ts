import { z } from "zod";
import { writeAuditLog } from "@/modules/audit/service";
import { changeCouponStatus } from "@/modules/coupons/service";
import { requireAdminMutationAccess } from "@/modules/admin-auth/guard";
import { getAdminMutationContext } from "@/modules/admin-auth/context";

const schema = z.object({
  id: z.string().min(1),
  status: z.enum(["active", "inactive", "archived"])
});

export async function POST(request: Request) {
  await requireAdminMutationAccess("admin");
  const payload = await request.json().catch(() => null);
  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    return Response.json({ success: false, error: { code: "INVALID_REQUEST", message: "Request is invalid." } }, { status: 400 });
  }

  const coupon = await changeCouponStatus(parsed.data);

  await writeAuditLog({
    ...getAdminMutationContext(),
    action: "coupon_status_changed",
    entityType: "coupon",
    entityId: coupon.id,
    afterData: coupon
  });

  return Response.json({ success: true, data: coupon });
}
