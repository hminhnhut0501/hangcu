"use client";

import { useEffect, useState } from "react";

type Config = {
  clientId: string;
  clientSecret: string;
  webhookId: string;
  configured: boolean;
  environment: "sandbox" | "live";
};

export function PayPalConfigForm() {
  const [config, setConfig] = useState<Config>({ clientId: "", clientSecret: "", webhookId: "", configured: false, environment: "sandbox" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/paypal").then((response) => response.json()).then((json) => setConfig({ ...json.data, clientId: "", clientSecret: "", webhookId: "" })).finally(() => setLoading(false));
  }, []);

  async function save() {
    setMessage("");
    const csrf = await fetch("/api/admin/csrf").then((response) => response.json());
    const response = await fetch("/api/admin/paypal", { method: "POST", credentials: "include", headers: { "content-type": "application/json", "x-csrf-token": csrf.data?.token || "" }, body: JSON.stringify(config) });
    const json = await response.json().catch(() => ({}));
    setMessage(response.ok ? "Đã lưu cấu hình PayPal." : json.error?.message || "Lưu thất bại.");
    if (response.ok) setConfig({ ...json.data, clientId: "", clientSecret: "", webhookId: "" });
  }

  if (loading) return <p className="p-6 text-sm text-slate-500">Đang tải cấu hình PayPal...</p>;
  return <section className="space-y-6 p-6">
    <div><p className="text-sm font-medium text-blue-600">Payments</p><h1 className="mt-2 text-3xl font-semibold">PayPal configuration</h1><p className="mt-2 text-sm text-slate-600">Lưu credential và webhook ID server-side. PayPal không cần mapping product, vì order truyền trực tiếp amount và currency.</p></div>
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between"><h2 className="text-xl font-semibold">API credentials</h2><span className={`rounded-full px-3 py-1 text-xs font-medium ${config.configured ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>{config.configured ? "Configured" : "Missing"}</span></div>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-sm">Client ID<input className="mt-2 w-full rounded-xl border p-3" value={config.clientId} onChange={(e) => setConfig({ ...config, clientId: e.target.value })} placeholder="Để trống để giữ giá trị hiện tại" /></label>
        <label className="text-sm">Client secret<input type="password" className="mt-2 w-full rounded-xl border p-3" value={config.clientSecret} onChange={(e) => setConfig({ ...config, clientSecret: e.target.value })} placeholder="Để trống để giữ giá trị hiện tại" /></label>
        <label className="text-sm">Webhook ID<input className="mt-2 w-full rounded-xl border p-3" value={config.webhookId} onChange={(e) => setConfig({ ...config, webhookId: e.target.value })} placeholder="Để trống để giữ giá trị hiện tại" /></label>
        <label className="text-sm">Environment<select className="mt-2 w-full rounded-xl border p-3" value={config.environment} onChange={(e) => setConfig({ ...config, environment: e.target.value as Config["environment"] })}><option value="sandbox">Sandbox</option><option value="live">Live</option></select></label>
      </div>
      <p className="text-xs text-slate-500">Webhook URL: <code>https://hangcu.vercel.app/api/payments/paypal/webhook</code></p>
    </div>
    <button type="button" onClick={save} className="rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white">Lưu cấu hình PayPal</button>{message ? <p className="text-sm text-slate-600">{message}</p> : null}
  </section>;
}
