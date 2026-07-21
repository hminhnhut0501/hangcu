import { retryWebhook } from "@/modules/webhooks/service";
import { requireAdminMutationAccess } from "@/modules/admin-auth/guard";
import { writeAuditLog } from "@/modules/audit/service";
import { getAdminMutationContext } from "@/modules/admin-auth/context";

export async function POST(request: Request) {
  await requireAdminMutationAccess("support");
  const contentType = request.headers.get("content-type") ?? "";
  let body: { provider?: string; providerEventId?: string } | null = null;

  if (contentType.includes("application/json")) {
    body = (await request.json().catch(() => null)) as { provider?: string; providerEventId?: string } | null;
  } else {
    const formData = await request.formData().catch(() => null);
    if (formData) {
      body = {
        provider: String(formData.get("provider") ?? ""),
        providerEventId: String(formData.get("providerEventId") ?? "")
      };
    }
  }

  if (!body?.provider || !body?.providerEventId) {
    return Response.json({ success: false, error: { code: "INVALID_REQUEST", message: "Request is invalid." } }, { status: 400 });
  }

  const event = await retryWebhook(body.provider, body.providerEventId);
  if (!event) {
    return Response.json({ success: false, error: { code: "NOT_FOUND", message: "Event not found." } }, { status: 404 });
  }

  await writeAuditLog({
    ...getAdminMutationContext(),
    action: "webhook_retried",
    entityType: "payment_event",
    entityId: body.providerEventId,
    afterData: {
      provider: body.provider,
      providerEventId: body.providerEventId
    }
  });

  return Response.json({ success: true, data: { provider: event.provider, providerEventId: event.providerEventId } });
}
