import { z } from "zod";
import { writeAuditLog } from "@/modules/audit/service";
import { requireAdminMutationAccess } from "@/modules/admin-auth/guard";
import { getAdminMutationContext } from "@/modules/admin-auth/context";
import { listAllOrders, updateOrder } from "@/modules/orders/service";

const bulkSchema = z.object({
  orderNumbers: z.array(z.string().min(1)).min(1),
  status: z.enum(["pending", "paid", "processing", "fulfilled", "failed", "cancelled"]).optional(),
  paymentStatus: z.enum(["unpaid", "pending", "paid", "failed", "refunded", "partially_refunded"]).optional(),
  fulfillmentStatus: z.enum(["unfulfilled", "processing", "partially_fulfilled", "fulfilled", "failed"]).optional(),
  notes: z.string().nullable().optional()
});

export async function PATCH(request: Request) {
  await requireAdminMutationAccess("support");
  const payload = await request.json().catch(() => null);
  const parsed = bulkSchema.safeParse(payload);
  if (!parsed.success) {
    return Response.json(
      { success: false, error: { code: "INVALID_REQUEST", message: "Request is invalid." } },
      { status: 400 }
    );
  }

  const orders = await listAllOrders();
  const targets = orders.filter((order) => parsed.data.orderNumbers.includes(order.orderNumber));
  if (targets.length === 0) {
    return Response.json(
      { success: false, error: { code: "NOT_FOUND", message: "No matching orders found." } },
      { status: 404 }
    );
  }

  const updated = [];
  for (const order of targets) {
    const result = await updateOrder(order.orderNumber, {
      ...(parsed.data.status ? { status: parsed.data.status } : {}),
      ...(parsed.data.paymentStatus ? { paymentStatus: parsed.data.paymentStatus } : {}),
      ...(parsed.data.fulfillmentStatus ? { fulfillmentStatus: parsed.data.fulfillmentStatus } : {}),
      ...(parsed.data.notes !== undefined ? { notes: parsed.data.notes } : {})
    });
    if (result) {
      updated.push(result);
      await writeAuditLog({
        ...getAdminMutationContext(),
        action: "order_bulk_updated",
        entityType: "order",
        entityId: result.orderNumber,
        afterData: result
      });
    }
  }

  return Response.json({ success: true, data: updated });
}
