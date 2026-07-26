import { listDonatePackages } from "@/modules/donate-packages/service";
import { SimpleAdminForm } from "@/components/admin/simple-form";
import { SupportPackageQuickRow } from "@/components/admin/support-package-quick-row";

export default async function AdminDonatePackagesPage() {
  const packages = await listDonatePackages();

  return (
    <section className="space-y-8">
      <div>
        <p className="text-sm font-medium text-blue-600">Support packages</p>
        <h2 className="mt-3 text-4xl font-semibold tracking-tight">Quản lý support packages</h2>
        <p className="mt-2 max-w-3xl text-sm text-slate-600">
          Quản lý các gói support tách biệt khỏi license, dùng để ghi nhận khoản ủng hộ tự nguyện.
        </p>
      </div>
      <SimpleAdminForm
        endpoint="/api/admin/donate-packages"
        submitLabel="Lưu gói"
        onSuccessMessage="Đã lưu support package."
        triggerLabel="Thêm support package"
        drawerTitle="Thêm support package"
        drawerDescription="Nhập thông tin gói support trong drawer để màn hình gọn hơn."
        fields={[
          { name: "id", label: "ID", defaultValue: "dp_new" },
          { name: "code", label: "Code", defaultValue: "SUPPORT_NEW" },
          { name: "name", label: "Tên", defaultValue: "Gói hỗ trợ mới" },
          { name: "suggestedAmountMinor", label: "Số tiền gợi ý", type: "number", defaultValue: "2000" },
          { name: "currency", label: "Tiền tệ", defaultValue: "USD" },
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
                  {pkg.currency ?? "USD"} {pkg.suggestedAmountMinor ? (pkg.suggestedAmountMinor / 100).toFixed(2) : "-"}
                </td>
                <td className="px-6 py-4">{pkg.status}</td>
                <td className="px-6 py-4">
                  <SupportPackageQuickRow packageItem={pkg} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
