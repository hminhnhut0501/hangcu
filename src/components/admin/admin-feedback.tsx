"use client";

export const ADMIN_STORAGE_BUCKET_MISSING_CODE = "STORAGE_BUCKET_MISSING" as const;

export function getAdminErrorMessage(error: unknown, fallback = "Thao tác thất bại.") {
  const code = getAdminErrorCode(error);
  if (code === ADMIN_STORAGE_BUCKET_MISSING_CODE) {
    return "Thiếu bucket Supabase Storage cho upload. Hãy chạy migration tạo bucket hoặc cấu hình SUPABASE_STORAGE_BUCKET đúng tên bucket.";
  }

  if (error instanceof Error) {
    return error.message || fallback;
  }

  if (typeof error === "string" && error.trim()) {
    return error;
  }

  return fallback;
}

export function getAdminErrorCode(error: unknown) {
  if (error && typeof error === "object" && "code" in error) {
    const code = (error as { code?: unknown }).code;
    return typeof code === "string" ? code : null;
  }

  if (error instanceof Error && error.message.includes(ADMIN_STORAGE_BUCKET_MISSING_CODE)) {
    return ADMIN_STORAGE_BUCKET_MISSING_CODE;
  }

  return null;
}

export function isStorageBucketMissingAdminError(error: unknown) {
  return getAdminErrorCode(error) === ADMIN_STORAGE_BUCKET_MISSING_CODE;
}

type AdminBannerProps = {
  tone?: "info" | "success" | "error";
  message: string;
};

export function AdminBanner({ tone = "info", message }: AdminBannerProps) {
  if (!message) return null;

  const styles =
    tone === "error"
      ? "border-rose-200 bg-rose-50 text-rose-700"
      : tone === "success"
        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
        : "border-slate-200 bg-slate-50 text-slate-700";

  return <div className={`rounded-2xl border px-4 py-3 text-sm ${styles}`}>{message}</div>;
}
