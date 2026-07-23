import { notFound } from "next/navigation";
import Link from "next/link";
import { LicenseKeyActionsForm } from "@/components/admin/license-key-actions-form";
import { ModeSwitchHeader } from "@/components/admin/mode-switch-header";
import { getLicenseKeyById } from "@/modules/license-keys/service";

const statusStyles: Record<string, string> = {
  available: "bg-slate-100 text-slate-700",
  reserved: "bg-amber-100 text-amber-800",
  issued: "bg-blue-100 text-blue-800",
  redeemed: "bg-emerald-100 text-emerald-800",
  expired: "bg-rose-100 text-rose-800",
  revoked: "bg-zinc-100 text-zinc-800"
};

function formatDate(value: Date | string | null) {
  if (!value) return "N/A";
  const date = value instanceof Date ? value : new Date(value);
  return new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

function formatStatus(value: string) {
  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${statusStyles[value] ?? "bg-slate-100 text-slate-700"}`}>{value}</span>;
}

export default async function AdminLicenseKeyDetailPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  const resolvedSearchParams = (await searchParams) ?? {};
  const mode = typeof resolvedSearchParams.mode === "string" ? resolvedSearchParams.mode : "basic";
  const isAdvanced = mode === "advanced";
  const key = await getLicenseKeyById(id);

  if (!key) {
    notFound();
  }

  return (
    <section className="space-y-8">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-3">
          <p className="text-sm font-medium text-blue-600">Chi tiết license</p>
          <h2 className="mt-3 text-4xl font-semibold tracking-tight">****{key.codeLastFour}</h2>
          <p className="text-sm text-slate-600">{key.id}</p>
          <div className="flex flex-wrap gap-2">
            {formatStatus(key.status)}
            <span className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
              {key.licensePlanId}
            </span>
          </div>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white px-5 py-4 shadow-[0_10px_35px_rgba(15,23,42,0.05)]">
          <p className="text-xs font-medium text-slate-400">Thao tác nhanh</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link
              href={`/admin/license-keys?mode=${isAdvanced ? "advanced" : "basic"}`}
              className="rounded-full border border-blue-200 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50"
            >
              Về danh sách
            </Link>
          </div>
        </div>
      </div>

      <ModeSwitchHeader
        currentMode={isAdvanced ? "advanced" : "basic"}
        options={[
          { key: "basic", label: "Basic", href: `/admin/license-keys/${key.id}?mode=basic` },
          { key: "advanced", label: "Advanced", href: `/admin/license-keys/${key.id}?mode=advanced` }
        ]}
        hint={isAdvanced ? "Hiện đầy đủ lifecycle và metadata." : "Gọn hơn, ưu tiên xem trạng thái và thao tác nhanh."}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_10px_35px_rgba(15,23,42,0.05)]">
          <p className="text-sm text-slate-500">Gói</p>
          <p className="mt-2 text-lg font-semibold">{key.licensePlanId}</p>
        </article>
        <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_10px_35px_rgba(15,23,42,0.05)]">
          <p className="text-sm text-slate-500">Đơn</p>
          <p className="mt-2 text-lg font-semibold">{key.orderId ?? "Không có"}</p>
        </article>
        <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_10px_35px_rgba(15,23,42,0.05)]">
          <p className="text-sm text-slate-500">Đã cấp lúc</p>
          <p className="mt-2 text-lg font-semibold">{formatDate(key.issuedAt)}</p>
        </article>
        <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_10px_35px_rgba(15,23,42,0.05)]">
          <p className="text-sm text-slate-500">Hết hạn lúc</p>
          <p className="mt-2 text-lg font-semibold">{formatDate(key.expiresAt)}</p>
        </article>
        {isAdvanced ? (
          <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_10px_35px_rgba(15,23,42,0.05)]">
            <p className="text-sm text-slate-500">Binding</p>
            <p className="mt-2 text-lg font-semibold">{key.bindingType ?? "unbound"}</p>
            <p className="mt-1 text-xs text-slate-500">{key.externalUserId ?? key.customerRef ?? "Chưa có binding"}</p>
          </article>
        ) : null}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
        <div className="space-y-6">
          {isAdvanced ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_10px_35px_rgba(15,23,42,0.05)]">
              <h3 className="text-lg font-semibold">Chi tiết vòng đời</h3>
              <dl className="mt-4 grid gap-4 text-sm md:grid-cols-2">
                <div>
                  <dt className="text-slate-500">Redeemed lúc</dt>
                  <dd className="mt-1 font-medium">{formatDate(key.redeemedAt)}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Đã redeem bởi</dt>
                  <dd className="mt-1 font-medium">{key.redeemedByExternalUserId ?? "N/A"}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Thu hồi lúc</dt>
                  <dd className="mt-1 font-medium">{formatDate(key.revokedAt)}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Lý do thu hồi</dt>
                  <dd className="mt-1 font-medium">{key.revokedReason ?? "N/A"}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Tham chiếu khách</dt>
                  <dd className="mt-1 font-medium">{key.customerRef ?? "Không có"}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">ID user ngoài</dt>
                  <dd className="mt-1 font-medium">{key.externalUserId ?? "Không có"}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Trạng thái hiện tại</dt>
                  <dd className="mt-1 font-medium">{formatStatus(key.status)}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Order item</dt>
                  <dd className="mt-1 font-medium">{key.orderItemId ?? "Không có"}</dd>
                </div>
              </dl>
            </div>
          ) : null}

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_10px_35px_rgba(15,23,42,0.05)]">
            <h3 className="text-lg font-semibold">Entitlements</h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {key.entitlementSnapshot.length === 0 ? (
                <span className="text-sm text-slate-500">Chưa có entitlement snapshot.</span>
              ) : (
                key.entitlementSnapshot.map((tag) => (
                  <span key={tag} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                    {tag}
                  </span>
                ))
              )}
            </div>
          </div>

          {isAdvanced ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-600 shadow-[0_10px_35px_rgba(15,23,42,0.05)]">
              Màn chi tiết này tối ưu cho hỗ trợ và chỉnh vòng đời. Chỉ dùng revoke hoặc expiry khi key không còn hợp lệ cho khách.
            </div>
          ) : null}
        </div>

        <div className="space-y-6">
          {isAdvanced ? (
            <LicenseKeyActionsForm
              keyId={key.id}
              currentStatus={key.status}
              currentExpiresAt={key.expiresAt?.toISOString() ?? null}
              currentRevokedReason={key.revokedReason}
              currentCustomerRef={key.customerRef}
              currentExternalUserId={key.externalUserId}
              currentNotes={(key.metadata.notes as string | undefined) ?? null}
              triggerLabel="Chỉnh vòng đời"
              drawerTitle="Chỉnh vòng đời license key"
              drawerDescription="Mở drawer để cập nhật trạng thái và metadata của key."
            />
          ) : (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_10px_35px_rgba(15,23,42,0.05)]">
              <h3 className="text-lg font-semibold">Thao tác nhanh</h3>
              <p className="mt-2 text-sm text-slate-600">
                Dùng advanced mode nếu cần revoke, expiry hoặc chỉnh metadata chi tiết.
              </p>
            </div>
          )}
          {isAdvanced ? (
            <>
              <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_10px_35px_rgba(15,23,42,0.05)]">
                <div className="border-b border-slate-200 px-6 py-4">
                  <h3 className="text-lg font-semibold">Metadata thô</h3>
                </div>
                <pre className="overflow-auto p-6 text-xs text-slate-700">
                  {JSON.stringify(key.metadata, null, 2)}
                </pre>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_10px_35px_rgba(15,23,42,0.05)]">
                <h3 className="text-lg font-semibold">Tóm tắt vòng đời</h3>
                <ul className="mt-4 space-y-2 text-sm text-slate-600">
                  <li>Đã cấp: {formatDate(key.issuedAt)}</li>
                  <li>Đã redeem: {formatDate(key.redeemedAt)}</li>
                  <li>Đã thu hồi: {formatDate(key.revokedAt)}</li>
                  <li>Lần đổi trạng thái gần nhất: {formatDate((key.metadata.updatedAt as string | undefined) ?? null)}</li>
                </ul>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </section>
  );
}
