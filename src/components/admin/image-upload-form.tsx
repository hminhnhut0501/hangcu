"use client";

import { useState, type FormEvent } from "react";

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
};

export function ImageUploadForm({ title, endpoint, folder, assetKey, description, extraFields = [] }: Props) {
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [url, setUrl] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
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

      const json = (await response.json()) as { data?: { publicUrl?: string } };
      if (!response.ok || !json.data?.publicUrl) throw new Error("Upload failed");

      setUrl(json.data.publicUrl);
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-slate-600">{description}</p>
      <input type="hidden" name="folder" value={folder} />
      <input type="hidden" name="assetKey" value={assetKey} />
      <input name="file" type="file" accept="image/*" className="mt-4 block w-full text-sm" />
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
      <button type="submit" className="mt-4 rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white">
        {status === "loading" ? "Uploading..." : "Upload image"}
      </button>
      {url ? (
        <div className="mt-4 rounded-xl bg-slate-50 p-3 text-xs text-slate-700">
          <p className="font-medium">Public URL</p>
          <p className="break-all">{url}</p>
        </div>
      ) : null}
      <p className="mt-3 text-sm text-slate-600">
        {status === "done" ? "Upload completed." : status === "error" ? "Upload failed." : null}
      </p>
    </form>
  );
}
