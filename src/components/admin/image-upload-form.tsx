"use client";

import { useState, type FormEvent } from "react";
import { AdminBanner, getAdminErrorMessage } from "@/components/admin/admin-feedback";
import { AdminPanel } from "@/components/admin/admin-shell";
import { AdminDrawer } from "@/components/admin/admin-drawer";

type Props = {
  title: string;
  endpoint: string;
  folder: string;
  assetKey: string;
  description: string;
  extraFields?: Array<{
    name: string;
    label: string;
    type?: string;
    placeholder?: string;
    defaultValue?: string;
  }>;
  triggerLabel?: string;
};

function ImageUploadFormInner({ title, endpoint, folder, assetKey, description, extraFields = [] }: Props) {
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [url, setUrl] = useState<string | null>(null);
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

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "x-csrf-token": token },
        credentials: "include",
        body: formData
      });

      const json = (await response.json().catch(() => null)) as { data?: { publicUrl?: string }; error?: { code?: string; message?: string } } | null;
      if (!response.ok) {
        throw new Error(json?.error?.code ?? json?.error?.message ?? "Upload failed");
      }
      if (!json?.data?.publicUrl) {
        throw new Error("Upload failed");
      }

      setUrl(json.data.publicUrl);
      setStatus("done");
      setMessage("Upload completed.");
    } catch (error) {
      setUrl(null);
      setStatus("error");
      setMessage(getAdminErrorMessage(error, "Upload failed."));
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_10px_35px_rgba(15,23,42,0.05)]">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-slate-600">{description}</p>
      <input type="hidden" name="folder" value={folder} />
      <input type="hidden" name="assetKey" value={assetKey} />
      <AdminPanel className="mt-4 bg-slate-50/70 p-4 shadow-none">
        <input name="file" type="file" accept="image/*" className="block w-full text-sm" />
        <div className="mt-4 grid gap-3">
          {extraFields.map((field) => (
            <label key={field.name} className="block">
              <span className="text-sm font-medium text-slate-700">{field.label}</span>
              <input
                name={field.name}
                type={field.type ?? "text"}
                placeholder={field.placeholder}
                defaultValue={field.defaultValue}
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
              />
            </label>
          ))}
        </div>
      </AdminPanel>
      <button type="submit" className="mt-4 rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white">
        {status === "loading" ? "Uploading..." : "Upload image"}
      </button>
      {url ? (
        <div className="mt-4 rounded-xl bg-slate-50 p-3 text-xs text-slate-700">
          <p className="font-medium">Public URL</p>
          <p className="break-all">{url}</p>
        </div>
      ) : null}
      <div className="mt-3 text-sm text-slate-600">
        {status === "done" ? <AdminBanner tone="success" message={message} /> : null}
        {status === "error" ? <AdminBanner tone="error" message={message} /> : null}
      </div>
    </form>
  );
}

export function ImageUploadForm(props: Props) {
  if (!props.triggerLabel) {
    return <ImageUploadFormInner {...props} />;
  }

  return (
    <AdminDrawer
      trigger={
        <button type="button" className="rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white shadow-sm">
          {props.triggerLabel}
        </button>
      }
      title={props.title}
      description={props.description}
    >
      <ImageUploadFormInner {...props} />
    </AdminDrawer>
  );
}
