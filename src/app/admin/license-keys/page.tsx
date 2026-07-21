import { listLicenseKeys } from "@/modules/license-keys/service";
import { SimpleAdminForm } from "@/components/admin/simple-form";

export default async function AdminLicenseKeysPage() {
  const keys = await listLicenseKeys();

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.3em] text-blue-600">
          License keys
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight">Manage license keys</h2>
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
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-6 py-4 font-medium">Plan</th>
              <th className="px-6 py-4 font-medium">Last four</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {keys.map((key) => (
              <tr key={key.id}>
                <td className="px-6 py-4">{key.licensePlanId}</td>
                <td className="px-6 py-4 font-medium">****{key.codeLastFour}</td>
                <td className="px-6 py-4">{key.status}</td>
                <td className="px-6 py-4 text-slate-500">Revoke via API</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
