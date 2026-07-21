import { listLicensePlans } from "@/modules/license-plans/service";
import { SimpleAdminForm } from "@/components/admin/simple-form";

export default async function AdminLicensePlansPage() {
  const plans = await listLicensePlans();

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.3em] text-blue-600">
          License plans
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight">Manage license plans</h2>
      </div>
      <SimpleAdminForm
        endpoint="/api/admin/license-plans"
        submitLabel="Save plan"
        onSuccessMessage="License plan saved."
        fields={[
          { name: "id", label: "ID", defaultValue: "lp_new" },
          { name: "code", label: "Code", defaultValue: "HCV_NEW" },
          { name: "name", label: "Name", defaultValue: "New License Plan" },
          { name: "nameVi", label: "Name VI", defaultValue: "Gói license mới" },
          { name: "nameEn", label: "Name EN", defaultValue: "New License Plan" },
          { name: "slug", label: "Slug", defaultValue: "new-license-plan" },
          { name: "description", label: "Description", defaultValue: "Description" },
          { name: "vndPrice", label: "VND price", type: "number", defaultValue: "199000" },
          { name: "usdPrice", label: "USD price", type: "number", defaultValue: "9.99" },
          { name: "planType", label: "Plan type", defaultValue: "regular" },
          { name: "durationDays", label: "Duration days", type: "number", defaultValue: "30" },
          { name: "isLifetime", label: "Is lifetime", type: "checkbox", defaultValue: "" },
          { name: "status", label: "Status", defaultValue: "active" },
          { name: "sortOrder", label: "Sort order", type: "number", defaultValue: "1" },
          { name: "entitlementTags", label: "Entitlement tags", defaultValue: "app_access,vip_group_access" }
        ]}
      />
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-6 py-4 font-medium">Code</th>
              <th className="px-6 py-4 font-medium">Name</th>
              <th className="px-6 py-4 font-medium">Type</th>
              <th className="px-6 py-4 font-medium">Duration</th>
              <th className="px-6 py-4 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {plans.map((plan) => (
              <tr key={plan.id}>
                <td className="px-6 py-4 font-medium">{plan.code}</td>
                <td className="px-6 py-4">{plan.name}</td>
                <td className="px-6 py-4">{plan.planType}</td>
                <td className="px-6 py-4">{plan.isLifetime ? "Lifetime" : `${plan.durationDays} days`}</td>
                <td className="px-6 py-4">{plan.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
