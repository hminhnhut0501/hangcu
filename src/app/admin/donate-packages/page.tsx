import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminStatsRow } from "@/components/admin/admin-stats-row";
import { AdminStatusBadge } from "@/components/admin/admin-status-badge";
import { listDonatePackages } from "@/modules/donate-packages/service";
import { SimpleAdminForm } from "@/components/admin/simple-form";
import { AdminMoneyDisplay } from "@/components/admin/admin-money-display";
import { SupportPackageEditDrawer } from "@/components/admin/support-package-edit-drawer";
import { SupportPackageActions } from "@/components/admin/support-package-actions";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminDonatePackagesPage() {
  const packages = await listDonatePackages();
  const activeCount = packages.filter((pkg) => pkg.status === "active").length;
  const hiddenCount = packages.filter((pkg) => pkg.status === "hidden").length;
  const withVnd = packages.filter((pkg) => pkg.vndAmountMinor != null).length;
  const withUsd = packages.filter((pkg) => pkg.usdAmountMinor != null).length;

  return (
    <section className="space-y-8">
      <AdminPageHeader
        eyebrow="Flexible support"
        title="Quản lý mức ủng hộ"
        description="Quản lý các mức gợi ý cho phần ủng hộ tự do, tách biệt khỏi license."
      />
      <AdminStatsRow
        stats={[
          { label: "Active", value: activeCount, tone: "emerald" },
          { label: "Hidden", value: hiddenCount, tone: "amber" },
          { label: "Có VNĐ", value: withVnd, tone: "blue" },
          { label: "Có USD", value: withUsd, tone: "violet" }
        ]}
      />
      <SimpleAdminForm
        endpoint="/api/admin/donate-packages"
        submitLabel="Lưu gói"
        onSuccessMessage="Đã lưu mức ủng hộ."
        triggerLabel="Thêm mức ủng hộ"
        drawerTitle="Thêm mức ủng hộ"
        drawerDescription="Nhập mức gợi ý cho phần ủng hộ tự do."
        fields={[
          { name: "id", label: "ID", defaultValue: "dp_new" },
          { name: "code", label: "Code", defaultValue: "SUPPORT_NEW" },
          { name: "name", label: "Tên", defaultValue: "Mức ủng hộ mới" },
          { name: "description", label: "Mô tả", defaultValue: "Mức ủng hộ tự do mới", type: "textarea" },
          { name: "vndPrice", label: "Số tiền gợi ý (VNĐ)", type: "number", defaultValue: "9900" },
          { name: "usdPrice", label: "Số tiền gợi ý (USD)", type: "number", defaultValue: "0" },
          { name: "status", label: "Trạng thái", defaultValue: "active" }
        ]}
      />
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_10px_35px_rgba(15,23,42,0.05)]">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-[#f8fbff] text-left text-slate-500">
            <tr>
              <th className="px-6 py-4 font-medium">Code</th>
              <th className="px-6 py-4 font-medium">Tên</th>
              <th className="px-6 py-4 font-medium">Slug</th>
              <th className="px-6 py-4 font-medium">Số tiền gợi ý</th>
              <th className="px-6 py-4 font-medium">Trạng thái</th>
              <th className="px-6 py-4 font-medium">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {packages.map((pkg) => (
              <tr key={pkg.id}>
                <td className="px-6 py-4 font-medium">{pkg.code}</td>
                <td className="px-6 py-4">{pkg.name}</td>
                <td className="px-6 py-4 text-slate-600">{pkg.slug}</td>
                <td className="px-6 py-4">
                  <div className="space-y-1">
                    <div><AdminMoneyDisplay amount={pkg.vndAmountMinor} currency="VND" locale="vi" /></div>
                    <div className="text-xs text-slate-500"><AdminMoneyDisplay amount={pkg.usdAmountMinor} currency="USD" locale="en" /></div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <AdminStatusBadge tone={pkg.status === "active" ? "emerald" : pkg.status === "hidden" ? "amber" : "neutral"} label={pkg.status} />
                </td>
                <td className="px-6 py-4">
                  <div className="space-y-3">
                    <SupportPackageEditDrawer packageItem={pkg} />
                    <SupportPackageActions id={pkg.id} />
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
