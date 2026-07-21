import { notFound } from "next/navigation";
import { LicenseKeyActionsForm } from "@/components/admin/license-key-actions-form";
import { getLicenseKeyById } from "@/modules/license-keys/service";

function formatDate(value: Date | string | null) {
  if (!value) return "N/A";
  const date = value instanceof Date ? value : new Date(value);
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

export default async function AdminLicenseKeyDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const key = await getLicenseKeyById(id);

  if (!key) {
    notFound();
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.3em] text-blue-600">License detail</p>
          <h2 className="mt-3 text-4xl font-semibold tracking-tight">****{key.codeLastFour}</h2>
          <p className="mt-2 text-sm text-slate-600">{key.id}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Current status</p>
          <p className="mt-2 text-2xl font-semibold">{key.status}</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Plan</p>
          <p className="mt-2 text-lg font-semibold">{key.licensePlanId}</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Order</p>
          <p className="mt-2 text-lg font-semibold">{key.orderId ?? "None"}</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Issued at</p>
          <p className="mt-2 text-lg font-semibold">{formatDate(key.issuedAt)}</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Expires at</p>
          <p className="mt-2 text-lg font-semibold">{formatDate(key.expiresAt)}</p>
        </article>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold">Lifecycle details</h3>
            <dl className="mt-4 grid gap-4 text-sm md:grid-cols-2">
              <div>
                <dt className="text-slate-500">Redeemed at</dt>
                <dd className="mt-1 font-medium">{formatDate(key.redeemedAt)}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Redeemed by</dt>
                <dd className="mt-1 font-medium">{key.redeemedByExternalUserId ?? "N/A"}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Revoked at</dt>
                <dd className="mt-1 font-medium">{formatDate(key.revokedAt)}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Revoked reason</dt>
                <dd className="mt-1 font-medium">{key.revokedReason ?? "N/A"}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Customer ref</dt>
                <dd className="mt-1 font-medium">{key.customerRef ?? "N/A"}</dd>
              </div>
              <div>
                <dt className="text-slate-500">External user ID</dt>
                <dd className="mt-1 font-medium">{key.externalUserId ?? "N/A"}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold">Entitlements</h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {key.entitlementSnapshot.length === 0 ? (
                <span className="text-sm text-slate-500">No entitlement snapshot yet.</span>
              ) : (
                key.entitlementSnapshot.map((tag) => (
                  <span key={tag} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                    {tag}
                  </span>
                ))
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-600 shadow-sm">
            Next phase can add bulk lifecycle actions, batch revoke, and export for support.
          </div>
        </div>

        <div className="space-y-6">
          <LicenseKeyActionsForm
            keyId={key.id}
            currentStatus={key.status}
            currentExpiresAt={key.expiresAt?.toISOString() ?? null}
            currentRevokedReason={key.revokedReason}
            currentCustomerRef={key.customerRef}
            currentExternalUserId={key.externalUserId}
            currentNotes={(key.metadata.notes as string | undefined) ?? null}
          />
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-6 py-4">
              <h3 className="text-lg font-semibold">Raw metadata</h3>
            </div>
            <pre className="overflow-auto p-6 text-xs text-slate-700">
              {JSON.stringify(key.metadata, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
}
