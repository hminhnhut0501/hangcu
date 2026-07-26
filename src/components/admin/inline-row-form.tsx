"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getAdminErrorMessage, AdminBanner } from "@/components/admin/admin-feedback";
import { hasMinimumAdminRole, type AdminRole } from "@/modules/hardening/permission";

type Field = {
  name: string;
  label: string;
  type?: string;
  defaultValue?: string;
};

type Props = {
  endpoint: string;
  fields: Field[];
  submitLabel?: string;
  onSuccessMessage: string;
  minimumRole?: AdminRole;
};

async function readErrorMessage(response: Response) {
  const json = await response.json().catch(() => null);
  const error = json?.error ?? json?.message ?? `Request failed (${response.status})`;
  if (error && typeof error === "object") {
    const code = typeof error.code === "string" && error.code.trim() ? error.code.trim() : null;
    const message = typeof error.message === "string" && error.message.trim() ? error.message.trim() : null;
    if (code && message) {
      return `${code}: ${message}`;
    }
    if (message) {
      return message;
    }
  }

  if (response.status === 403) {
    return "FORBIDDEN: Forbidden";
  }

  return getAdminErrorMessage(error, `Request failed (${response.status})`);
}

export function InlineRowForm({ endpoint, fields, submitLabel = "Lưu", onSuccessMessage, minimumRole = "content_manager" }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");
  const [sessionStatus, setSessionStatus] = useState<"loading" | "ready" | "missing">("loading");
  const [sessionRole, setSessionRole] = useState<AdminRole | null>(null);
  const canEdit = useMemo(() => {
    if (!sessionRole) return false;
    return hasMinimumAdminRole(sessionRole, minimumRole);
  }, [minimumRole, sessionRole]);

  useEffect(() => {
    let active = true;

    const loadSession = async () => {
      try {
        const response = await fetch("/api/admin/session", { cache: "no-store", credentials: "include" });
        const json = (await response.json().catch(() => null)) as { success?: boolean; data?: { role?: AdminRole } | null } | null;
        if (!active) return;

        const role = json?.success && json.data?.role ? json.data.role : null;
        setSessionRole(role);
        setSessionStatus(role ? "ready" : "missing");

        if (!role && pathname !== "/admin/login") {
          router.replace("/admin/login");
        }
      } catch {
        if (!active) return;
        setSessionRole(null);
        setSessionStatus("missing");
        if (pathname !== "/admin/login") {
          router.replace("/admin/login");
        }
      }
    };

    void loadSession();

    return () => {
      active = false;
    };
  }, [pathname, router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canEdit) {
      setStatus("error");
      setMessage(sessionStatus === "missing" ? "MISSING_ADMIN_SESSION: Chưa có phiên đăng nhập admin." : "FORBIDDEN: Bạn chưa đủ quyền để sửa mục này.");
      return;
    }
    setStatus("loading");
    setMessage("");

    try {
      const formData = new FormData(event.currentTarget);
      const csrfResponse = await fetch("/api/admin/csrf", { method: "GET", credentials: "include" });
      const csrfJson = (await csrfResponse.json()) as { data?: { token?: string } };
      const token = csrfJson.data?.token;
      if (!token) throw new Error("Missing CSRF token");

      const payload: Record<string, unknown> = {};
      for (const field of fields) {
        if (field.type === "checkbox") {
          payload[field.name] = formData.has(field.name);
          continue;
        }
        payload[field.name] = formData.get(field.name);
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-csrf-token": token
        },
        credentials: "include",
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(await readErrorMessage(response));
      }

      setStatus("done");
      setMessage(onSuccessMessage);
      router.refresh();
    } catch (error) {
      setStatus("error");
      setMessage(getAdminErrorMessage(error, "Submission failed."));
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
      {sessionStatus === "loading" ? <AdminBanner message="Đang kiểm tra phiên đăng nhập..." /> : null}
      {sessionStatus === "missing" ? <AdminBanner tone="error" message="MISSING_ADMIN_SESSION: Chưa có phiên đăng nhập admin." /> : null}
      {sessionStatus === "ready" && !canEdit ? (
        <AdminBanner tone="error" message={`FORBIDDEN: Role hiện tại (${sessionRole ?? "unknown"}) chưa đủ quyền sửa.`} />
      ) : null}
      {canEdit
        ? fields.map((field) => (
            <label key={field.name} className="min-w-[140px] flex-1">
              <span className="mb-1 block text-xs font-medium text-slate-500">{field.label}</span>
              {field.type === "checkbox" ? (
                <input
                  name={field.name}
                  type="checkbox"
                  defaultChecked={field.defaultValue === "true" || field.defaultValue === "on"}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
              ) : (
                <input
                  name={field.name}
                  type={field.type ?? "text"}
                  defaultValue={field.defaultValue}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
                />
              )}
            </label>
          ))
        : null}
      {canEdit ? (
        <button type="submit" disabled={status === "loading"} className="rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white disabled:opacity-50">
          {status === "loading" ? "Đang lưu..." : submitLabel}
        </button>
      ) : null}
      {status === "done" ? <AdminBanner tone="success" message={message || onSuccessMessage} /> : null}
      {status === "error" ? <AdminBanner tone="error" message={message || "Gửi biểu mẫu thất bại."} /> : null}
    </form>
  );
}
