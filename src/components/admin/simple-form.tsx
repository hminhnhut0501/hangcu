"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { AdminBanner, getAdminErrorMessage } from "@/components/admin/admin-feedback";
import { AdminPanel } from "@/components/admin/admin-shell";

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
};

async function readErrorMessage(response: Response) {
  const json = await response.json().catch(() => null);
  const error = json?.error?.message ?? json?.message ?? json?.error ?? `Request failed (${response.status})`;
  return getAdminErrorMessage(error, `Request failed (${response.status})`);
}

export function SimpleAdminForm({ endpoint, fields = [], sections, submitLabel, onSuccessMessage, confirmMessage }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState<string>("");
  const formSections = sections?.length ? sections : [{ title: "", fields }];

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
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
        {formSections.map((section) => (
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
        ))}
      </div>
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
    </form>
  );
}
