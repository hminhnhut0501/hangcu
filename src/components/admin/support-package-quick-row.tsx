"use client";

import { InlineRowForm } from "@/components/admin/inline-row-form";

type Props = {
  packageItem: {
    id: string;
    code: string;
    name: string;
    description: string;
    slug: string;
    vndAmountMinor: number | null;
    usdAmountMinor: number | null;
    status: "active" | "hidden" | "archived";
  };
};

export function SupportPackageQuickRow({ packageItem }: Props) {
  return (
    <InlineRowForm
      endpoint="/api/admin/donate-packages"
      submitLabel="Lưu"
      onSuccessMessage="Đã cập nhật support package."
      fields={[
        { name: "id", label: "ID", defaultValue: packageItem.id },
        { name: "code", label: "Code", defaultValue: packageItem.code },
        { name: "name", label: "Tên", defaultValue: packageItem.name },
        { name: "description", label: "Mô tả", defaultValue: packageItem.description },
        { name: "slug", label: "Slug", defaultValue: packageItem.slug },
        { name: "vndPrice", label: "Số tiền gợi ý (VNĐ)", type: "number", defaultValue: String(packageItem.vndAmountMinor ?? "") },
        { name: "usdPrice", label: "Số tiền gợi ý (USD)", type: "number", defaultValue: String(packageItem.usdAmountMinor ?? "") },
        { name: "status", label: "Trạng thái", defaultValue: packageItem.status }
      ]}
    />
  );
}
