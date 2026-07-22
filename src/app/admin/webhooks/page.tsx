import { listWebhookSummaries } from "@/modules/webhooks/service";
import { WebhookRetryButton } from "@/components/admin/webhook-retry-button";

export default async function AdminWebhooksPage() {
  const webhooks = await listWebhookSummaries();

  return (
    <section className="space-y-8">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.3em] text-blue-600">Webhooks</p>
        <h2 className="mt-3 text-4xl font-semibold tracking-tight">Giám sát webhook</h2>
        <p className="mt-2 max-w-3xl text-sm text-slate-600">
          Theo dõi event từ cổng thanh toán, kiểm tra chữ ký và retry khi cần.
        </p>
      </div>
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_10px_35px_rgba(15,23,42,0.05)]">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-[#f8fbff] text-left text-slate-500">
            <tr>
              <th className="px-6 py-4 font-medium">Provider</th>
              <th className="px-6 py-4 font-medium">Event</th>
              <th className="px-6 py-4 font-medium">Chữ ký</th>
              <th className="px-6 py-4 font-medium">Trạng thái</th>
              <th className="px-6 py-4 font-medium">Nhận lúc</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {webhooks.map((event) => (
              <tr key={`${event.provider}-${event.eventId}`}>
                <td className="px-6 py-4">{event.provider}</td>
                <td className="px-6 py-4">{event.eventType}</td>
                <td className="px-6 py-4">{event.signatureValid ? "Hợp lệ" : "Không hợp lệ"}</td>
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
