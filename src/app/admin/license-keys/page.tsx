import { AdminPageHeader } from "@/components/admin/admin-page-header";
import Link from "next/link";
import { LicenseKeyBulkActions } from "@/components/admin/license-key-bulk-actions";
import { SimpleAdminForm } from "@/components/admin/simple-form";
import { ModeSwitchHeader } from "@/components/admin/mode-switch-header";
import { FilterPills } from "@/components/admin/filter-pills";
import { AdminStatsRow } from "@/components/admin/admin-stats-row";
import { AdminFilterBar } from "@/components/admin/admin-filter-bar";
import { AdminStatusBadge } from "@/components/admin/admin-status-badge";
import { listLicenseKeys } from "@/modules/license-keys/service";

const quickFilters = [
  { label: "Tất cả", href: "/admin/license-keys" },
  { label: "Đã cấp", href: "/admin/license-keys?status=issued" },
  { label: "Đã redeem", href: "/admin/license-keys?status=redeemed" },
  { label: "Sẵn sàng", href: "/admin/license-keys?status=available" },
  { label: "Đã thu hồi", href: "/admin/license-keys?status=revoked" }
];

function formatDate(value: Date | string | null) {
  if (!value) return "N/A";
  const date = value instanceof Date ? value : new Date(value);
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

function formatStatus(value: string) {
  const tone =
    value === "redeemed"
      ? "emerald"
      : value === "issued"
        ? "blue"
        : value === "reserved"
          ? "amber"
          : value === "expired"
            ? "rose"
            : "neutral";
  return <AdminStatusBadge tone={tone} label={value} />;
}

export default async function AdminLicenseKeysPage({
  searchParams
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = (await searchParams) ?? {};
  const mode = typeof params.mode === "string" ? params.mode : "basic";
  const isAdvanced = mode === "advanced";
  const keys = await listLicenseKeys();
  const q = typeof params.q === "string" ? params.q.trim().toLowerCase() : "";
  const status = typeof params.status === "string" ? params.status : "";
  const planId = typeof params.licensePlanId === "string" ? params.licensePlanId : "";

  const filtered = keys.filter((key) => {
    const matchesQuery =
      !q ||
      key.codeLastFour.toLowerCase().includes(q) ||
      key.customerRef?.toLowerCase().includes(q) ||
      key.externalUserId?.toLowerCase().includes(q) ||
      key.id.toLowerCase().includes(q);
    const matchesStatus = !status || key.status === status;
    const matchesPlan = !planId || key.licensePlanId === planId;
    return matchesQuery && matchesStatus && matchesPlan;
  });

  const availableCount = filtered.filter((key) => key.status === "available").length;
  const issuedCount = filtered.filter((key) => key.status === "issued").length;
  const redeemedCount = filtered.filter((key) => key.status === "redeemed").length;
  const revokedCount = filtered.filter((key) => key.status === "revoked").length;

  return (
    <section className="space-y-6">
      <AdminPageHeader
        eyebrow="License lifecycle"
        title="Quản lý license keys"
        description="Xem các key đã cấp, theo dõi trạng thái redeem và thực hiện thao tác lifecycle cho admin."
      />
      <AdminStatsRow
        stats={[
          { label: "Keys", value: filtered.length },
          { label: "Sẵn sàng", value: availableCount },
          { label: "Đã cấp", value: issuedCount, tone: "blue" },
          { label: "Đã redeem", value: redeemedCount, tone: "emerald" }
        ]}
      />

      <div className="flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <span className="text-xs font-medium text-slate-400">Phím tắt</span>
        <Link href="/admin/license-keys?status=available" className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-white">
          Key sẵn sàng
        </Link>
        <Link href="/admin/license-keys?status=issued" className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-white">
          Đã cấp
        </Link>
        <Link href="/admin/license-keys?status=redeemed" className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-white">
          Đã redeem
        </Link>
        <Link href="/admin/audit?entityType=license_key" className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-white">
          Mở audit
        </Link>
      </div>

      <ModeSwitchHeader
        currentMode={isAdvanced ? "advanced" : "basic"}
        options={[
          { key: "basic", label: "Basic", href: "/admin/license-keys?mode=basic" },
          { key: "advanced", label: "Advanced", href: "/admin/license-keys?mode=advanced" }
        ]}
        hint={isAdvanced ? "Hiện bulk action và bảng đầy đủ." : "Gọn hơn, ưu tiên thao tác tạo key và lọc nhanh."}
      />

      <FilterPills
        pills={quickFilters.map((filter) => ({
          ...filter,
          active: filter.href === "/admin/license-keys" ? !status : filter.href.includes(`status=${status}`)
        }))}
      />

      <SimpleAdminForm
        endpoint="/api/admin/license-keys"
        submitLabel="Tạo key"
        onSuccessMessage="Đã tạo license key."
        fields={[
          { name: "licensePlanId", label: "License plan ID", defaultValue: "lp_30d" },
          { name: "orderId", label: "Order ID", defaultValue: "order_demo" },
          { name: "orderItemId", label: "Order item ID", defaultValue: "item_demo" },
          { name: "code", label: "Mã key", defaultValue: "HC-TEST-KEY1" },
          { name: "expiresAt", label: "Hết hạn lúc", defaultValue: "" }
        ]}
      />

      <AdminFilterBar
        asForm
        actions={
          <>
            <button type="submit" className="rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white">
              Áp dụng bộ lọc
            </button>
            <Link
              href="/admin/license-keys"
              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Xóa lọc
            </Link>
            <span className="text-sm text-slate-500">Đã thu hồi: {revokedCount}</span>
          </>
        }
      >
        <input
          name="q"
          defaultValue={typeof params.q === "string" ? params.q : ""}
          placeholder="Tìm key id, customer ref hoặc 4 số cuối"
          className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 lg:col-span-2"
        />
        <input
          name="status"
          defaultValue={status}
          placeholder="Trạng thái"
          className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
        />
        <input
          name="licensePlanId"
          defaultValue={planId}
          placeholder="License plan ID"
          className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
        />
      </AdminFilterBar>

      {isAdvanced ? (
        <LicenseKeyBulkActions
          keys={filtered.map((key) => ({
            id: key.id,
            codeLastFour: key.codeLastFour,
            licensePlanId: key.licensePlanId,
            status: key.status,
            customerRef: key.customerRef,
            externalUserId: key.externalUserId,
            href: `/admin/license-keys/${key.id}`
          }))}
        />
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-6 py-4 font-medium">Key</th>
              <th className="px-6 py-4 font-medium">Gói</th>
              <th className="px-6 py-4 font-medium">Trạng thái</th>
              {isAdvanced ? <th className="px-6 py-4 font-medium">Binding</th> : null}
              {isAdvanced ? <th className="px-6 py-4 font-medium">Vòng đời</th> : null}
              <th className="px-6 py-4 font-medium">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filtered.length === 0 ? (
              <tr>
                <td className="px-6 py-10 text-center text-slate-500" colSpan={isAdvanced ? 6 : 4}>
                  Chưa có license key nào phù hợp.
                </td>
              </tr>
            ) : (
              filtered.map((key) => (
                <tr key={key.id}>
                  <td className="px-6 py-4">
                    <p className="font-medium">****{key.codeLastFour}</p>
                    <p className="text-xs text-slate-500">{key.id}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium">{key.licensePlanId}</p>
                    <p className="text-xs text-slate-500">Order: {key.orderId ?? "không có"}</p>
                  </td>
                  <td className="px-6 py-4">{formatStatus(key.status)}</td>
                  {isAdvanced ? (
                    <td className="px-6 py-4">
                      <p className="font-medium">{key.bindingType ?? "unbound"}</p>
                      <p className="text-xs text-slate-500">{key.externalUserId ?? key.customerRef ?? "Chưa gắn customer"}</p>
                    </td>
                  ) : null}
                  {isAdvanced ? (
                    <td className="px-6 py-4 text-slate-600">
                      <p>Đã cấp: {formatDate(key.issuedAt)}</p>
                      <p>Hết hạn: {formatDate(key.expiresAt)}</p>
                      <p>Đã redeem: {formatDate(key.redeemedAt)}</p>
                    </td>
                  ) : null}
                  <td className="px-6 py-4">
                    <Link
                      href={`/admin/license-keys/${key.id}`}
                      className="rounded-full border border-slate-200 px-4 py-2 text-xs font-medium text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                    >
                      Mở chi tiết
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
