"use client";

import { AdminDrawer } from "@/components/admin/admin-drawer";
import { SimpleAdminForm } from "@/components/admin/simple-form";

type SupportPackage = {
  id: string;
  code: string;
  name: string;
  slug: string;
  description: string;
  vndAmountMinor: number | null;
  usdAmountMinor: number | null;
  status: "active" | "hidden" | "archived";
};

type Props = {
  packageItem: SupportPackage;
};

export function SupportPackageEditDrawer({ packageItem }: Props) {
  return (
    <AdminDrawer
      trigger={
        <button type="button" className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50">
          Sửa
        </button>
      }
      title="Sửa support package"
      description="Chỉnh thông tin gói support ngay trong drawer."
    >
      <SimpleAdminForm
        endpoint="/api/admin/donate-packages"
        submitLabel="Cập nhật gói"
        onSuccessMessage="Đã cập nhật support package."
        confirmMessage="Lưu thay đổi cho support package này?"
        fields={[
          { name: "id", label: "ID", defaultValue: packageItem.id },
          { name: "code", label: "Code", defaultValue: packageItem.code },
          { name: "name", label: "Tên", defaultValue: packageItem.name },
          { name: "slug", label: "Slug", defaultValue: packageItem.slug },
          { name: "description", label: "Mô tả", defaultValue: packageItem.description, type: "textarea", rows: 4 },
          { name: "vndPrice", label: "Số tiền gợi ý (VNĐ)", type: "number", defaultValue: String(packageItem.vndAmountMinor ?? "") },
          { name: "usdPrice", label: "Số tiền gợi ý (USD)", type: "number", defaultValue: String(packageItem.usdAmountMinor ?? "") },
          { name: "status", label: "Trạng thái", defaultValue: packageItem.status }
        ]}
      />
    </AdminDrawer>
  );
}
