import { listDonatePackages } from "@/modules/donate-packages/service";
import { SimpleAdminForm } from "@/components/admin/simple-form";

export default async function AdminDonatePackagesPage() {
  const packages = await listDonatePackages();

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.3em] text-blue-600">
          Donate packages
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight">Manage donate packages</h2>
      </div>
      <SimpleAdminForm
        endpoint="/api/admin/donate-packages"
        submitLabel="Save package"
        onSuccessMessage="Donate package saved."
        fields={[
          { name: "id", label: "ID", defaultValue: "dp_new" },
          { name: "code", label: "Code", defaultValue: "DONATE_NEW" },
          { name: "name", label: "Name", defaultValue: "New Donate Package" },
          { name: "slug", label: "Slug", defaultValue: "new-donate-package" },
          { name: "description", label: "Description", defaultValue: "Description" },
          { name: "suggestedAmountMinor", label: "Suggested amount minor", type: "number", defaultValue: "2000" },
          { name: "currency", label: "Currency", defaultValue: "USD" },
          { name: "status", label: "Status", defaultValue: "active" }
        ]}
      />
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-6 py-4 font-medium">Code</th>
              <th className="px-6 py-4 font-medium">Name</th>
              <th className="px-6 py-4 font-medium">Suggested</th>
              <th className="px-6 py-4 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {packages.map((pkg) => (
              <tr key={pkg.id}>
                <td className="px-6 py-4 font-medium">{pkg.code}</td>
                <td className="px-6 py-4">{pkg.name}</td>
                <td className="px-6 py-4">
                  {pkg.currency ?? "USD"} {pkg.suggestedAmountMinor ? (pkg.suggestedAmountMinor / 100).toFixed(2) : "-"}
                </td>
                <td className="px-6 py-4">{pkg.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
