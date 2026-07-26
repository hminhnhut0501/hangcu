"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { getAdminErrorMessage, AdminBanner } from "@/components/admin/admin-feedback";

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
};

async function readErrorMessage(response: Response) {
  const json = await response.json().catch(() => null);
  const error = json?.error?.message ?? json?.message ?? json?.error ?? `Request failed (${response.status})`;
  return getAdminErrorMessage(error, `Request failed (${response.status})`);
}

export function InlineRowForm({ endpoint, fields, submitLabel = "Lưu", onSuccessMessage }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
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
      {fields.map((field) => (
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
      ))}
      <button type="submit" disabled={status === "loading"} className="rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white disabled:opacity-50">
        {status === "loading" ? "Đang lưu..." : submitLabel}
      </button>
      {status === "done" ? <AdminBanner tone="success" message={message || onSuccessMessage} /> : null}
      {status === "error" ? <AdminBanner tone="error" message={message || "Gửi biểu mẫu thất bại."} /> : null}
    </form>
  );
}
