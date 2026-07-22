import { listLicensePlans } from "@/modules/license-plans/service";
import { SimpleAdminForm } from "@/components/admin/simple-form";
import { LicensePlanActions } from "@/components/admin/license-plan-actions";
import { ModeSwitchHeader } from "@/components/admin/mode-switch-header";

export default async function AdminLicensePlansPage({ searchParams }: { searchParams?: Promise<{ edit?: string }> | { edit?: string } }) {
  const plans = await listLicensePlans();
  const resolvedSearchParams = searchParams ? await Promise.resolve(searchParams) : {};
  const editPlan = resolvedSearchParams.edit ? plans.find((plan) => plan.id === resolvedSearchParams.edit) ?? null : null;
  const defaults = editPlan ?? plans[0] ?? null;
  const mode = typeof (resolvedSearchParams as { mode?: string }).mode === "string" ? (resolvedSearchParams as { mode?: string }).mode : "payment-only";
  const isAdvanced = mode === "advanced";

  return (
    <section className="space-y-8">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.3em] text-blue-600">License plans</p>
        <h2 className="mt-3 text-4xl font-semibold tracking-tight">Quản lý license plans</h2>
        <p className="mt-2 max-w-3xl text-sm text-slate-600">
          Giữ giao diện gọn cho payment-only mode. Có thể sửa plan hiện tại hoặc xóa plan cũ mà không đụng các field nội bộ.
        </p>
      </div>
      <ModeSwitchHeader
        currentMode={isAdvanced ? "advanced" : "payment-only"}
        options={[
          { key: "payment-only", label: "Payment-only", href: "/admin/license-plans?mode=payment-only" },
          { key: "advanced", label: "Advanced", href: "/admin/license-plans?mode=advanced" }
        ]}
        hint={isAdvanced ? "Hiện đầy đủ field kỹ thuật." : "Chỉ giữ field thanh toán cốt lõi."}
      />
      <SimpleAdminForm
        endpoint="/api/admin/license-plans"
        submitLabel={editPlan ? "Cập nhật gói" : "Lưu gói"}
        onSuccessMessage={editPlan ? "Đã cập nhật license plan." : "Đã lưu license plan."}
        confirmMessage={editPlan ? "Lưu thay đổi cho plan này?" : undefined}
        fields={
          isAdvanced
            ? [
                { name: "id", label: "ID", defaultValue: defaults?.id ?? "lp_new" },
                { name: "code", label: "Code", defaultValue: defaults?.code ?? "HCV_NEW" },
                { name: "name", label: "Tên", defaultValue: defaults?.name ?? "New License Plan" },
                { name: "nameVi", label: "Tên VI", defaultValue: defaults?.nameVi ?? "Gói license mới" },
                { name: "nameEn", label: "Tên EN", defaultValue: defaults?.nameEn ?? "New License Plan" },
                { name: "slug", label: "Slug", defaultValue: defaults?.slug ?? "new-license-plan" },
                { name: "description", label: "Mô tả", defaultValue: defaults?.description ?? "Description" },
                { name: "vndPrice", label: "Giá VND", type: "number", defaultValue: String(defaults?.currencyPrices?.VND ?? 199000) },
                { name: "usdPrice", label: "Giá USD", type: "number", defaultValue: String(defaults?.currencyPrices?.USD ?? 9.99) },
                { name: "planType", label: "Loại gói", defaultValue: defaults?.planType ?? "regular" },
                { name: "durationDays", label: "Số ngày", type: "number", defaultValue: String(defaults?.durationDays ?? 30) },
                { name: "isLifetime", label: "Trọn đời", type: "checkbox", defaultValue: defaults?.isLifetime ? "true" : "" },
                { name: "status", label: "Trạng thái", defaultValue: defaults?.status ?? "active" },
                { name: "sortOrder", label: "Thứ tự", type: "number", defaultValue: String(defaults?.sortOrder ?? 1) },
                { name: "entitlementTags", label: "Entitlement tags", defaultValue: defaults?.entitlementTags?.join(",") ?? "app_access,vip_group_access" }
              ]
            : [
                { name: "id", label: "ID", defaultValue: defaults?.id ?? "lp_new" },
                { name: "code", label: "Code", defaultValue: defaults?.code ?? "HCV_NEW" },
                { name: "name", label: "Tên", defaultValue: defaults?.name ?? "New License Plan" },
                { name: "nameVi", label: "Tên VI", defaultValue: defaults?.nameVi ?? "Gói license mới" },
                { name: "nameEn", label: "Tên EN", defaultValue: defaults?.nameEn ?? "New License Plan" },
                { name: "vndPrice", label: "Giá VND", type: "number", defaultValue: String(defaults?.currencyPrices?.VND ?? 199000) },
                { name: "usdPrice", label: "Giá USD", type: "number", defaultValue: String(defaults?.currencyPrices?.USD ?? 9.99) },
                { name: "status", label: "Trạng thái", defaultValue: defaults?.status ?? "active" },
                { name: "sortOrder", label: "Thứ tự", type: "number", defaultValue: String(defaults?.sortOrder ?? 1) }
              ]
        }
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
                  <LicensePlanActions id={plan.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
