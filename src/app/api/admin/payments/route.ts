import { z } from "zod";
import { listWebhookSummaries } from "@/modules/webhooks/service";
import { requireAdminMutationAccess } from "@/modules/admin-auth/guard";
import { retryWebhook } from "@/modules/webhooks/service";
import { writeAuditLog } from "@/modules/audit/service";
import { getAdminMutationContext } from "@/modules/admin-auth/context";

const listQuerySchema = z.object({
  q: z.string().optional(),
  provider: z.string().optional(),
  status: z.string().optional()
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = listQuerySchema.parse({
    q: searchParams.get("q") ?? undefined,
    provider: searchParams.get("provider") ?? undefined,
    status: searchParams.get("status") ?? undefined
  });

  const events = await listWebhookSummaries();
  const filtered = events.filter((event) => {
    const term = parsed.q?.trim().toLowerCase();
    const matchesQuery =
      !term ||
      event.provider.toLowerCase().includes(term) ||
      event.eventId.toLowerCase().includes(term) ||
      event.eventType.toLowerCase().includes(term);
    const matchesProvider = !parsed.provider || event.provider === parsed.provider;
    const matchesStatus = !parsed.status || event.processingStatus === parsed.status;
    return matchesQuery && matchesProvider && matchesStatus;
  });

  return Response.json({ success: true, data: filtered });
}

const retrySchema = z.object({
  provider: z.string().min(1),
  providerEventId: z.string().min(1)
});

export async function POST(request: Request) {
  await requireAdminMutationAccess("support");
  const payload = await request.json().catch(() => null);
  const parsed = retrySchema.safeParse(payload);
  if (!parsed.success) {
    return Response.json(
      { success: false, error: { code: "INVALID_REQUEST", message: "Request is invalid." } },
      { status: 400 }
    );
  }

  const event = await retryWebhook(parsed.data.provider, parsed.data.providerEventId);
  if (!event) {
    return Response.json(
      { success: false, error: { code: "NOT_FOUND", message: "Event not found." } },
      { status: 404 }
    );
  }

  await writeAuditLog({
    ...getAdminMutationContext(),
    action: "payment_event_retried",
    entityType: "payment_event",
    entityId: parsed.data.providerEventId,
    afterData: {
      provider: parsed.data.provider,
      providerEventId: parsed.data.providerEventId,
      processingStatus: event.processingStatus
    }
  });

  return Response.json({ success: true, data: event });
}
