import { listLicensePlans } from "@/modules/license-plans/service";
import { SimpleAdminForm } from "@/components/admin/simple-form";

export default async function AdminLicensePlansPage() {
  const plans = await listLicensePlans();

  return (
    <section className="space-y-8">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.3em] text-blue-600">License plans</p>
        <h2 className="mt-3 text-4xl font-semibold tracking-tight">Quản lý license plans</h2>
        <p className="mt-2 max-w-3xl text-sm text-slate-600">
          Quản lý gói 30 ngày và trọn đời, đồng bộ tên hiển thị tiếng Việt và tiếng Anh cho storefront.
        </p>
      </div>
      <SimpleAdminForm
        endpoint="/api/admin/license-plans"
        submitLabel="Lưu gói"
        onSuccessMessage="Đã lưu license plan."
        fields={[
          { name: "id", label: "ID", defaultValue: "lp_new" },
          { name: "code", label: "Code", defaultValue: "HCV_NEW" },
          { name: "name", label: "Tên", defaultValue: "New License Plan" },
          { name: "nameVi", label: "Tên VI", defaultValue: "Gói license mới" },
          { name: "nameEn", label: "Tên EN", defaultValue: "New License Plan" },
          { name: "slug", label: "Slug", defaultValue: "new-license-plan" },
          { name: "description", label: "Mô tả", defaultValue: "Description" },
          { name: "vndPrice", label: "Giá VND", type: "number", defaultValue: "199000" },
          { name: "usdPrice", label: "Giá USD", type: "number", defaultValue: "9.99" },
          { name: "planType", label: "Loại gói", defaultValue: "regular" },
          { name: "durationDays", label: "Số ngày", type: "number", defaultValue: "30" },
          { name: "isLifetime", label: "Trọn đời", type: "checkbox", defaultValue: "" },
          { name: "status", label: "Trạng thái", defaultValue: "active" },
          { name: "sortOrder", label: "Thứ tự", type: "number", defaultValue: "1" },
          { name: "entitlementTags", label: "Entitlement tags", defaultValue: "app_access,vip_group_access" }
        ]}
      />
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_10px_35px_rgba(15,23,42,0.05)]">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-[#f8fbff] text-left text-slate-500">
            <tr>
              <th className="px-6 py-4 font-medium">Code</th>
              <th className="px-6 py-4 font-medium">Tên</th>
              <th className="px-6 py-4 font-medium">Loại</th>
              <th className="px-6 py-4 font-medium">Thời hạn</th>
              <th className="px-6 py-4 font-medium">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {plans.map((plan) => (
              <tr key={plan.id}>
                <td className="px-6 py-4 font-medium">{plan.code}</td>
                <td className="px-6 py-4">{plan.name}</td>
                <td className="px-6 py-4">{plan.planType}</td>
                <td className="px-6 py-4">{plan.isLifetime ? "Trọn đời" : `${plan.durationDays} ngày`}</td>
                <td className="px-6 py-4">{plan.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
