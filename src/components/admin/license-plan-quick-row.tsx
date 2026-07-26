"use client";

import { InlineRowForm } from "@/components/admin/inline-row-form";

type Props = {
  plan: {
    id: string;
    code: string;
    name: string;
    currencyPrices: { VND: number | null; USD: number | null };
    status: "active" | "hidden" | "archived";
    sortOrder: number;
  };
};

export function LicensePlanQuickRow({ plan }: Props) {
  return (
    <InlineRowForm
      endpoint="/api/admin/license-plans"
      submitLabel="Lưu"
      onSuccessMessage="Đã cập nhật plan."
      fields={[
        { name: "id", label: "ID", defaultValue: plan.id },
        { name: "code", label: "Code", defaultValue: plan.code },
        { name: "name", label: "Tên", defaultValue: plan.name },
        { name: "vndPrice", label: "Giá VND", type: "number", defaultValue: String(plan.currencyPrices.VND ?? "") },
        { name: "usdPrice", label: "Giá USD", type: "number", defaultValue: String(plan.currencyPrices.USD ?? "") },
        { name: "status", label: "Trạng thái", defaultValue: plan.status },
        { name: "sortOrder", label: "Thứ tự", type: "number", defaultValue: String(plan.sortOrder) }
      ]}
    />
  );
}
