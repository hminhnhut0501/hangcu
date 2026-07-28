import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminStatsRow } from "@/components/admin/admin-stats-row";
import { AdminStatusBadge } from "@/components/admin/admin-status-badge";
import { listLicensePlans } from "@/modules/license-plans/service";
import { SimpleAdminForm } from "@/components/admin/simple-form";
import { LicensePlanActions } from "@/components/admin/license-plan-actions";
import { AdminMoneyDisplay } from "@/components/admin/admin-money-display";
import { LicensePlanEditDrawer } from "@/components/admin/license-plan-edit-drawer";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminLicensePlansPage() {
  const plans = await listLicensePlans();
  const groupCount = plans.filter((plan) => Array.isArray((plan.metadata?.vipGroupPolicy as { groupIds?: unknown[] } | undefined)?.groupIds) && ((plan.metadata?.vipGroupPolicy as { groupIds?: unknown[] } | undefined)?.groupIds?.length ?? 0) > 0).length;
  const activeCount = plans.filter((plan) => plan.status === "active").length;
  const hiddenCount = plans.filter((plan) => plan.status === "hidden").length;
  const lifetimeCount = plans.filter((plan) => plan.isLifetime).length;
  const regularCount = plans.filter((plan) => !plan.isLifetime).length;

  return (
    <section className="space-y-8">
      <AdminPageHeader
        eyebrow="License plans"
        title="Quản lý license plans"
        description="Sửa nhanh giá, trạng thái và thứ tự ngay trong dòng. Mở drawer khi cần sửa sâu hơn."
      />
      <AdminStatsRow
        stats={[
          { label: "Active", value: activeCount, tone: "emerald" },
          { label: "Hidden", value: hiddenCount, tone: "amber" },
          { label: "30 ngày", value: regularCount, tone: "blue" },
          { label: "Lifetime", value: lifetimeCount, tone: "violet" },
          { label: "VIP groups", value: groupCount, tone: "default" }
        ]}
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
          { name: "vndPrice", label: "Giá VNĐ", type: "number", defaultValue: "199000" },
          { name: "usdPrice", label: "Giá USD", type: "number", defaultValue: "9.99" },
          { name: "planType", label: "Loại gói", defaultValue: "regular" },
          { name: "durationDays", label: "Số ngày", type: "number", defaultValue: "30" },
          { name: "isLifetime", label: "Trọn đời", type: "checkbox", defaultValue: "" },
          { name: "status", label: "Trạng thái", defaultValue: "active" },
          { name: "sortOrder", label: "Thứ tự", type: "number", defaultValue: "1" },
          { name: "entitlementTags", label: "Entitlement tags", defaultValue: "app_access,vip_group_access" },
          { name: "vipGroupIds", label: "Telegram group IDs", type: "textarea", rows: 3, defaultValue: "group_1\ngroup_2" }
        ]}
      />
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_10px_35px_rgba(15,23,42,0.05)]">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-[#f8fbff] text-left text-slate-500">
            <tr>
              <th className="px-6 py-4 font-medium">Code</th>
              <th className="px-6 py-4 font-medium">Tên</th>
              <th className="px-6 py-4 font-medium">Giá</th>
              <th className="px-6 py-4 font-medium">Telegram groups</th>
              <th className="px-6 py-4 font-medium">Trạng thái</th>
              <th className="px-6 py-4 font-medium">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {plans.map((plan) => (
              <tr key={plan.id}>
                <td className="px-6 py-4 font-medium">{plan.code}</td>
                <td className="px-6 py-4">{plan.name}</td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-2">
                    <AdminMoneyDisplay amount={plan.currencyPrices.VND} currency="VND" locale="vi" kind="catalog" />
                    <span>/</span>
                    <AdminMoneyDisplay amount={plan.currencyPrices.USD} currency="USD" locale="en" kind="catalog" />
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  {(() => {
                    const groupIds = (plan.metadata?.vipGroupPolicy as { groupIds?: string[] } | undefined)?.groupIds ?? [];
                    return groupIds.length > 0 ? `${groupIds.length} group(s)` : "—";
                  })()}
                </td>
                <td className="px-6 py-4">
                  <AdminStatusBadge tone={plan.status === "active" ? "emerald" : plan.status === "hidden" ? "amber" : "neutral"} label={plan.status} />
                </td>
                <td className="px-6 py-4">
                  <div className="space-y-3">
                    <LicensePlanEditDrawer plan={plan} isAdvanced={false} />
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
