import { z } from "zod";
import { writeAuditLog } from "@/modules/audit/service";
import { requireAdminMutationAccess } from "@/modules/admin-auth/guard";
import { getAdminMutationContext } from "@/modules/admin-auth/context";
import { listAllOrders } from "@/modules/orders/service";

const listQuerySchema = z.object({
  q: z.string().optional(),
  status: z.string().optional(),
  paymentStatus: z.string().optional(),
  fulfillmentStatus: z.string().optional()
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = listQuerySchema.parse({
    q: searchParams.get("q") ?? undefined,
    status: searchParams.get("status") ?? undefined,
    paymentStatus: searchParams.get("paymentStatus") ?? undefined,
    fulfillmentStatus: searchParams.get("fulfillmentStatus") ?? undefined
  });

  const orders = await listAllOrders();
  const filtered = orders.filter((order) => {
    const term = parsed.q?.trim().toLowerCase();
    const matchesQuery =
      !term ||
      order.orderNumber.toLowerCase().includes(term) ||
      order.customerEmail.toLowerCase().includes(term);

    const matchesStatus = !parsed.status || order.status === parsed.status;
    const matchesPayment = !parsed.paymentStatus || order.paymentStatus === parsed.paymentStatus;
    const matchesFulfillment =
      !parsed.fulfillmentStatus || order.fulfillmentStatus === parsed.fulfillmentStatus;

    return matchesQuery && matchesStatus && matchesPayment && matchesFulfillment;
  });

  return Response.json({ success: true, data: filtered });
}

const updateSchema = z.object({
  orderNumber: z.string().min(1),
  status: z.enum(["pending", "paid", "processing", "fulfilled", "failed", "cancelled"]).optional(),
  paymentStatus: z.enum(["unpaid", "pending", "paid", "failed", "refunded", "partially_refunded"]).optional(),
  fulfillmentStatus: z.enum(["unfulfilled", "processing", "partially_fulfilled", "fulfilled", "failed"]).optional(),
  notes: z.string().nullable().optional()
});

export async function PATCH(request: Request) {
  await requireAdminMutationAccess("support");
  const payload = await request.json().catch(() => null);
  const parsed = updateSchema.safeParse(payload);
  if (!parsed.success) {
    return Response.json(
      { success: false, error: { code: "INVALID_REQUEST", message: "Request is invalid." } },
      { status: 400 }
    );
  }

  const order = (await listAllOrders()).find((entry) => entry.orderNumber === parsed.data.orderNumber);
  if (!order) {
    return Response.json(
      { success: false, error: { code: "NOT_FOUND", message: "Order not found." } },
      { status: 404 }
    );
  }

  const { updateOrder } = await import("@/modules/orders/service");
  const updated = await updateOrder(parsed.data.orderNumber, {
    ...(parsed.data.status ? { status: parsed.data.status } : {}),
    ...(parsed.data.paymentStatus ? { paymentStatus: parsed.data.paymentStatus } : {}),
    ...(parsed.data.fulfillmentStatus ? { fulfillmentStatus: parsed.data.fulfillmentStatus } : {}),
    ...(parsed.data.notes !== undefined ? { notes: parsed.data.notes } : {})
  });

  if (!updated) {
    return Response.json(
      { success: false, error: { code: "NOT_FOUND", message: "Order not found." } },
      { status: 404 }
    );
  }

  await writeAuditLog({
    ...getAdminMutationContext(),
    action: "order_updated",
    entityType: "order",
    entityId: updated.orderNumber,
    afterData: updated
  });

  return Response.json({ success: true, data: updated });
}
