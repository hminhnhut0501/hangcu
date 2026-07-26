"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AdminBanner, getAdminErrorMessage } from "@/components/admin/admin-feedback";
import { AdminPanel } from "@/components/admin/admin-shell";
import { AdminDrawer } from "@/components/admin/admin-drawer";
import { hasMinimumAdminRole, type AdminRole } from "@/modules/hardening/permission";

type Field = {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  defaultValue?: string;
  rows?: number;
};

type Props = {
  endpoint: string;
  fields?: Field[];
  sections?: Array<{
    title: string;
    description?: string;
    fields: Field[];
  }>;
  submitLabel: string;
  onSuccessMessage: string;
  confirmMessage?: string;
  triggerLabel?: string;
  drawerTitle?: string;
  drawerDescription?: string;
  defaultOpen?: boolean;
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

function SimpleAdminFormInner({
  endpoint,
  fields = [],
  sections,
  submitLabel,
  onSuccessMessage,
  confirmMessage,
  minimumRole = "content_manager"
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState<string>("");
  const [sessionStatus, setSessionStatus] = useState<"loading" | "ready" | "missing">("loading");
  const [sessionRole, setSessionRole] = useState<AdminRole | null>(null);
  const formSections = sections?.length ? sections : [{ title: "", fields }];
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
      setMessage(sessionStatus === "missing" ? "MISSING_ADMIN_SESSION: Chưa có phiên đăng nhập admin." : "FORBIDDEN: Bạn chưa đủ quyền để sửa nội dung này.");
      return;
    }
    if (confirmMessage && !window.confirm(confirmMessage)) {
      return;
    }
    setStatus("loading");
    setMessage("");
    try {
      const formData = new FormData(event.currentTarget);
      const csrfResponse = await fetch("/api/admin/csrf", { method: "GET", credentials: "include" });
      const csrfJson = (await csrfResponse.json()) as { data?: { token?: string } };
      const token = csrfJson.data?.token;

      if (!token) {
        throw new Error("Missing CSRF token");
      }

      const payload: Record<string, unknown> = {};
      for (const field of fields) {
        if (field.type === "checkbox") {
          payload[field.name] = formData.has(field.name);
          continue;
        }

        const raw = formData.get(field.name);
        payload[field.name] = raw;
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
    <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_10px_35px_rgba(15,23,42,0.05)]">
      <div className="space-y-6">
        {sessionStatus === "loading" ? <AdminBanner message="Đang kiểm tra phiên đăng nhập..." /> : null}
        {sessionStatus === "missing" ? <AdminBanner tone="error" message="MISSING_ADMIN_SESSION: Chưa có phiên đăng nhập admin." /> : null}
        {sessionStatus === "ready" && !canEdit ? (
          <AdminBanner tone="error" message={`FORBIDDEN: Role hiện tại (${sessionRole ?? "unknown"}) chưa đủ quyền sửa.`} />
        ) : null}
        {canEdit
          ? formSections.map((section) => (
              <AdminPanel key={section.title || "default"} className="space-y-4 bg-slate-50/70 p-4 shadow-none">
                {section.title ? (
                  <div>
                    <h3 className="text-base font-semibold text-slate-950">{section.title}</h3>
                    {section.description ? <p className="mt-1 text-sm text-slate-600">{section.description}</p> : null}
                  </div>
                ) : null}
                <div className="grid gap-4 md:grid-cols-2">
                  {section.fields.map((field) => (
                    <label key={field.name} className="block">
                      <span className="text-sm font-medium text-slate-700">{field.label}</span>
                      {field.type === "textarea" ? (
                        <textarea
                          name={field.name}
                          placeholder={field.placeholder}
                          defaultValue={field.defaultValue}
                          rows={field.rows ?? 5}
                          className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-mono text-sm outline-none ring-0 focus:border-blue-500"
                        />
                      ) : (
                        <input
                          name={field.name}
                          type={field.type ?? "text"}
                          placeholder={field.placeholder}
                          defaultValue={field.type === "checkbox" ? undefined : field.defaultValue}
                          defaultChecked={field.type === "checkbox" ? field.defaultValue === "true" || field.defaultValue === "on" : undefined}
                          className={field.type === "checkbox"
                            ? "mt-2 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                            : "mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none ring-0 focus:border-blue-500"}
                        />
                      )}
                    </label>
                  ))}
                </div>
              </AdminPanel>
            ))
          : null}
      </div>
      {canEdit ? (
        <div className="mt-6 flex items-center gap-3">
          <button
            type="submit"
            className="rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white disabled:opacity-50"
            disabled={status === "loading"}
          >
            {status === "loading" ? "Đang lưu..." : submitLabel}
          </button>
          <div className="text-sm text-slate-600">
            {status === "done" ? <AdminBanner tone="success" message={message || onSuccessMessage} /> : null}
            {status === "error" ? <AdminBanner tone="error" message={message || "Gửi biểu mẫu thất bại."} /> : null}
          </div>
        </div>
      ) : null}
    </form>
  );
}

export function SimpleAdminForm(props: Props) {
  if (!props.triggerLabel) {
    return <SimpleAdminFormInner {...props} />;
  }

  return (
    <AdminDrawer
      trigger={
        <button type="button" className="rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white shadow-sm">
          {props.triggerLabel}
        </button>
      }
      title={props.drawerTitle ?? props.submitLabel}
      description={props.drawerDescription}
      defaultOpen={props.defaultOpen}
    >
      <SimpleAdminFormInner {...props} />
    </AdminDrawer>
  );
}
