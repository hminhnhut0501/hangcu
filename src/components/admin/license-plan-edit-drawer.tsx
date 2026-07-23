"use client";

import { AdminDrawer } from "@/components/admin/admin-drawer";
import { SimpleAdminForm } from "@/components/admin/simple-form";

type LicensePlan = {
  id: string;
  code: string;
  name: string;
  nameVi: string;
  nameEn: string;
  slug: string;
  description: string;
  currencyPrices: {
    VND: number | null;
    USD: number | null;
  };
  planType: "regular" | "donate_bonus" | "special";
  durationDays: number;
  isLifetime: boolean;
  status: "active" | "hidden" | "archived";
  sortOrder: number;
  entitlementTags: string[];
};

type Props = {
  plan: LicensePlan;
  isAdvanced: boolean;
};

export function LicensePlanEditDrawer({ plan, isAdvanced }: Props) {
  const fields = isAdvanced
    ? [
        { name: "id", label: "ID", defaultValue: plan.id },
        { name: "code", label: "Code", defaultValue: plan.code },
        { name: "name", label: "Tên", defaultValue: plan.name },
        { name: "nameVi", label: "Tên VI", defaultValue: plan.nameVi },
        { name: "nameEn", label: "Tên EN", defaultValue: plan.nameEn },
        { name: "slug", label: "Slug", defaultValue: plan.slug },
        { name: "description", label: "Mô tả", defaultValue: plan.description },
        { name: "vndPrice", label: "Giá VND", type: "number", defaultValue: String(plan.currencyPrices.VND ?? "") },
        { name: "usdPrice", label: "Giá USD", type: "number", defaultValue: String(plan.currencyPrices.USD ?? "") },
        { name: "planType", label: "Loại gói", defaultValue: plan.planType },
        { name: "durationDays", label: "Số ngày", type: "number", defaultValue: String(plan.durationDays) },
        { name: "isLifetime", label: "Trọn đời", type: "checkbox", defaultValue: plan.isLifetime ? "true" : "" },
        { name: "status", label: "Trạng thái", defaultValue: plan.status },
        { name: "sortOrder", label: "Thứ tự", type: "number", defaultValue: String(plan.sortOrder) },
        { name: "entitlementTags", label: "Entitlement tags", defaultValue: plan.entitlementTags.join(",") }
      ]
    : [
        { name: "id", label: "ID", defaultValue: plan.id },
        { name: "code", label: "Code", defaultValue: plan.code },
        { name: "name", label: "Tên", defaultValue: plan.name },
        { name: "nameVi", label: "Tên VI", defaultValue: plan.nameVi },
        { name: "nameEn", label: "Tên EN", defaultValue: plan.nameEn },
        { name: "vndPrice", label: "Giá VND", type: "number", defaultValue: String(plan.currencyPrices.VND ?? "") },
        { name: "usdPrice", label: "Giá USD", type: "number", defaultValue: String(plan.currencyPrices.USD ?? "") },
        { name: "status", label: "Trạng thái", defaultValue: plan.status },
        { name: "sortOrder", label: "Thứ tự", type: "number", defaultValue: String(plan.sortOrder) }
      ];

  return (
    <AdminDrawer
      trigger={
        <button type="button" className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50">
          Sửa
        </button>
      }
      title="Sửa license plan"
      description="Chỉnh dữ liệu plan ngay trong drawer."
    >
      <SimpleAdminForm
        endpoint="/api/admin/license-plans"
        submitLabel="Cập nhật gói"
        onSuccessMessage="Đã cập nhật license plan."
        confirmMessage="Lưu thay đổi cho plan này?"
        fields={fields}
      />
    </AdminDrawer>
  );
}
