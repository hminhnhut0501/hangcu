import { notFound } from "next/navigation";
import Link from "next/link";
import { PaymentRetryButton } from "@/components/admin/payment-retry-button";
import { getWebhookEvent } from "@/modules/webhooks/service";

const statusStyles: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  processed: "bg-emerald-100 text-emerald-800",
  failed: "bg-rose-100 text-rose-800"
};

function formatDate(value: Date | string | null | undefined) {
  if (!value) return "N/A";
  const date = value instanceof Date ? value : new Date(value);
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
}

function formatBadge(value: string) {
  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${statusStyles[value] ?? "bg-slate-100 text-slate-700"}`}>{value}</span>;
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
    <section className="space-y-8">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-3">
          <p className="text-sm font-medium text-blue-600">Chi tiết payment</p>
          <h2 className="mt-3 text-4xl font-semibold tracking-tight">{event.providerEventId}</h2>
          <p className="text-sm text-slate-600">Provider: {event.provider} • Type: {event.eventType}</p>
          <div className="flex flex-wrap gap-2">
            {formatBadge(event.processingStatus)}
            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${event.signatureValid ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"}`}>
              {event.signatureValid ? "signature hợp lệ" : "signature không hợp lệ"}
            </span>
          </div>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white px-5 py-4 shadow-[0_10px_35px_rgba(15,23,42,0.05)]">
          <p className="text-xs font-medium text-slate-400">Đơn liên quan</p>
          <p className="mt-2 text-lg font-semibold">
            {typeof payload.orderNumber === "string" ? payload.orderNumber : "Unknown"}
          </p>
          <div className="mt-3">
            <PaymentRetryButton
              provider={event.provider}
              providerEventId={event.providerEventId}
              triggerLabel="Thử lại payment"
              drawerTitle="Retry payment event"
              drawerDescription="Mở drawer để xác nhận thử lại event payment này."
            />
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_10px_35px_rgba(15,23,42,0.05)]">
          <p className="text-sm text-slate-500">Provider</p>
          <p className="mt-2 text-lg font-semibold">{event.provider}</p>
        </article>
        <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_10px_35px_rgba(15,23,42,0.05)]">
          <p className="text-sm text-slate-500">Xử lý lúc</p>
          <p className="mt-2 text-lg font-semibold">{formatDate(event.processedAt)}</p>
        </article>
        <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_10px_35px_rgba(15,23,42,0.05)]">
          <p className="text-sm text-slate-500">Lỗi</p>
          <p className="mt-2 text-lg font-semibold">{event.errorMessage ?? "Không có"}</p>
        </article>
        <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_10px_35px_rgba(15,23,42,0.05)]">
          <p className="text-sm text-slate-500">Hành động</p>
          <div className="mt-2">
            <Link
              href="/admin/payments"
              className="inline-flex rounded-full border border-blue-200 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50"
            >
              Về danh sách thanh toán
            </Link>
          </div>
        </article>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_10px_35px_rgba(15,23,42,0.05)]">
          <h3 className="text-lg font-semibold">Payload</h3>
          <pre className="mt-4 overflow-auto rounded-2xl bg-slate-950 p-4 text-xs text-slate-100">
            {JSON.stringify(payload, null, 2)}
          </pre>
        </div>
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_10px_35px_rgba(15,23,42,0.05)]">
            <h3 className="text-lg font-semibold">Ghi chú vận hành</h3>
            <ul className="mt-4 space-y-2 text-sm text-slate-600">
              <li>Chỉ retry khi provider đã gửi event cuối cùng.</li>
              <li>Event lỗi nên đối chiếu với trạng thái đơn và fulfillment log.</li>
              <li>Phase sau có thể nối đối soát riêng cho từng provider và payout reference.</li>
            </ul>
          </div>
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-600 shadow-[0_10px_35px_rgba(15,23,42,0.05)]">
            Đơn liên quan: {typeof payload.orderNumber === "string" ? payload.orderNumber : "Unknown"}
          </div>
        </div>
      </div>
    </section>
  );
}
