import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { listLicensePlans } from "@/modules/license-plans/service";
import { SimpleAdminForm } from "@/components/admin/simple-form";
import { LicensePlanActions } from "@/components/admin/license-plan-actions";
import { LicensePlanQuickRow } from "@/components/admin/license-plan-quick-row";

export default async function AdminLicensePlansPage({ searchParams }: { searchParams?: Promise<{ mode?: string }> }) {
  const plans = await listLicensePlans();

  return (
    <section className="space-y-8">
      <AdminPageHeader
        eyebrow="License plans"
        title="Quản lý license plans"
        description="Sửa nhanh giá, trạng thái và thứ tự ngay trong dòng. Mở drawer khi cần sửa sâu hơn."
      />
      <SimpleAdminForm
        endpoint="/api/admin/license-plans"
        submitLabel="Lưu gói"
        onSuccessMessage="Đã lưu license plan."
        triggerLabel="Thêm gói"
        drawerTitle="Thêm license plan"
        drawerDescription="Nhập dữ liệu plan mới trong drawer cho gọn."
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
              <th className="px-6 py-4 font-medium">Giá</th>
              <th className="px-6 py-4 font-medium">Trạng thái</th>
              <th className="px-6 py-4 font-medium">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {plans.map((plan) => (
              <tr key={plan.id}>
                <td className="px-6 py-4 font-medium">{plan.code}</td>
                <td className="px-6 py-4">{plan.name}</td>
                <td className="px-6 py-4">{plan.currencyPrices.VND ? `${plan.currencyPrices.VND.toLocaleString("vi-VN")}đ` : "-"} / {plan.currencyPrices.USD ? `${plan.currencyPrices.USD} USD` : "-"}</td>
                <td className="px-6 py-4">{plan.status}</td>
                <td className="px-6 py-4">
                  <div className="space-y-3">
                    <LicensePlanQuickRow plan={plan} />
                    <div className="flex items-center gap-3">
                      <LicensePlanActions id={plan.id} />
                    </div>
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
