"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

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
  fields: Field[];
  submitLabel: string;
  onSuccessMessage: string;
  confirmMessage?: string;
};

async function readErrorMessage(response: Response) {
  const json = await response.json().catch(() => null);
  return json?.error?.message ?? json?.message ?? json?.error ?? `Request failed (${response.status})`;
}

export function SimpleAdminForm({ endpoint, fields, submitLabel, onSuccessMessage, confirmMessage }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState<string>("");

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
      setMessage(error instanceof Error ? error.message : "Submission failed.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="grid gap-4 md:grid-cols-2">
        {fields.map((field) => (
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
      <div className="mt-6 flex items-center gap-3">
        <button
          type="submit"
          className="rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white disabled:opacity-50"
          disabled={status === "loading"}
        >
          {status === "loading" ? "Saving..." : submitLabel}
        </button>
        <p className="text-sm text-slate-600">
          {status === "done" ? message || onSuccessMessage : status === "error" ? message || "Submission failed." : null}
        </p>
      </div>
    </form>
  );
}
