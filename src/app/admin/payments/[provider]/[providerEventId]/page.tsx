import { notFound } from "next/navigation";
import { PaymentRetryButton } from "@/components/admin/payment-retry-button";
import { getWebhookEvent } from "@/modules/webhooks/service";

function formatDate(value: Date | string | null | undefined) {
  if (!value) return "N/A";
  const date = value instanceof Date ? value : new Date(value);
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
}

export default async function AdminPaymentDetailPage({
  params
}: {
  params: Promise<{ provider: string; providerEventId: string }>;
}) {
  const { provider, providerEventId } = await params;
  const event = await getWebhookEvent(provider, providerEventId);

  if (!event) {
    notFound();
  }

  const payload = event.payload as Record<string, unknown>;

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.3em] text-blue-600">Payment detail</p>
          <h2 className="mt-3 text-4xl font-semibold tracking-tight">{event.providerEventId}</h2>
          <p className="mt-2 text-sm text-slate-600">
            Provider: {event.provider} • Type: {event.eventType}
          </p>
        </div>
        <PaymentRetryButton provider={event.provider} providerEventId={event.providerEventId} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Processing status</p>
          <p className="mt-2 text-lg font-semibold">{event.processingStatus}</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Signature</p>
          <p className="mt-2 text-lg font-semibold">{event.signatureValid ? "valid" : "invalid"}</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Processed at</p>
          <p className="mt-2 text-lg font-semibold">{formatDate(event.processedAt)}</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Error</p>
          <p className="mt-2 text-lg font-semibold">{event.errorMessage ?? "None"}</p>
        </article>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold">Payload</h3>
          <pre className="mt-4 overflow-auto rounded-xl bg-slate-950 p-4 text-xs text-slate-100">
            {JSON.stringify(payload, null, 2)}
          </pre>
        </div>
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold">Operational notes</h3>
            <ul className="mt-4 space-y-2 text-sm text-slate-600">
              <li>Use retry only after the provider delivered a final event.</li>
              <li>Failed events should be checked against order status and fulfillment logs.</li>
              <li>Next phase can wire provider-specific reconciliation and payout references.</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-600 shadow-sm">
            Related order: {typeof payload.orderNumber === "string" ? payload.orderNumber : "Unknown"}
          </div>
        </div>
      </div>
    </section>
  );
}
