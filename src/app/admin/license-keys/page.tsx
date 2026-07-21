import { LicenseKeyBulkActions } from "@/components/admin/license-key-bulk-actions";
import { SimpleAdminForm } from "@/components/admin/simple-form";
import { listLicenseKeys } from "@/modules/license-keys/service";

export default async function AdminLicenseKeysPage({
  searchParams
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = (await searchParams) ?? {};
  const keys = await listLicenseKeys();
  const q = typeof params.q === "string" ? params.q.trim().toLowerCase() : "";
  const status = typeof params.status === "string" ? params.status : "";
  const planId = typeof params.licensePlanId === "string" ? params.licensePlanId : "";

  const filtered = keys.filter((key) => {
    const matchesQuery =
      !q ||
      key.codeLastFour.toLowerCase().includes(q) ||
      key.customerRef?.toLowerCase().includes(q) ||
      key.externalUserId?.toLowerCase().includes(q) ||
      key.id.toLowerCase().includes(q);
    const matchesStatus = !status || key.status === status;
    const matchesPlan = !planId || key.licensePlanId === planId;
    return matchesQuery && matchesStatus && matchesPlan;
  });

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.3em] text-blue-600">License lifecycle</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight">Manage license keys</h2>
          <p className="mt-2 max-w-3xl text-sm text-slate-600">
            Inspect issued keys, track redemption state, and perform admin lifecycle actions.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <article className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Keys</p>
            <p className="mt-2 text-2xl font-semibold">{filtered.length}</p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Issued</p>
            <p className="mt-2 text-2xl font-semibold">{filtered.filter((key) => key.status === "issued").length}</p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Redeemed</p>
            <p className="mt-2 text-2xl font-semibold">{filtered.filter((key) => key.status === "redeemed").length}</p>
          </article>
        </div>
      </div>

      <SimpleAdminForm
        endpoint="/api/admin/license-keys"
        submitLabel="Create key"
        onSuccessMessage="License key created."
        fields={[
          { name: "licensePlanId", label: "License plan ID", defaultValue: "lp_30d" },
          { name: "orderId", label: "Order ID", defaultValue: "order_demo" },
          { name: "orderItemId", label: "Order item ID", defaultValue: "item_demo" },
          { name: "code", label: "Key code", defaultValue: "HC-TEST-KEY1" },
          { name: "expiresAt", label: "Expires at", defaultValue: "" }
        ]}
      />

      <form className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:grid-cols-3">
        <input
          name="q"
          defaultValue={typeof params.q === "string" ? params.q : ""}
          placeholder="Search key id, customer ref, or last four"
          className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
        />
        <input
          name="status"
          defaultValue={status}
          placeholder="Status"
          className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
        />
        <input
          name="licensePlanId"
          defaultValue={planId}
          placeholder="License plan ID"
          className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
        />
      </form>

      <LicenseKeyBulkActions
        keys={filtered.map((key) => ({
          id: key.id,
          codeLastFour: key.codeLastFour,
          licensePlanId: key.licensePlanId,
          status: key.status,
          customerRef: key.customerRef,
          externalUserId: key.externalUserId,
          href: `/admin/license-keys/${key.id}`
        }))}
      />
    </section>
  );
}
