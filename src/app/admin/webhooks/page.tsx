import { listWebhookSummaries } from "@/modules/webhooks/service";
import { WebhookRetryButton } from "@/components/admin/webhook-retry-button";

export default async function AdminWebhooksPage() {
  const webhooks = await listWebhookSummaries();

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.3em] text-blue-600">
          Webhooks
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight">Webhook monitor</h2>
      </div>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-6 py-4 font-medium">Provider</th>
              <th className="px-6 py-4 font-medium">Event</th>
              <th className="px-6 py-4 font-medium">Signature</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Received</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {webhooks.map((event) => (
              <tr key={`${event.provider}-${event.eventId}`}>
                <td className="px-6 py-4">{event.provider}</td>
                <td className="px-6 py-4">{event.eventType}</td>
                <td className="px-6 py-4">{event.signatureValid ? "valid" : "invalid"}</td>
                <td className="px-6 py-4">{event.processingStatus}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <span>{event.receivedAt}</span>
                    <WebhookRetryButton provider={event.provider} providerEventId={event.eventId} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
