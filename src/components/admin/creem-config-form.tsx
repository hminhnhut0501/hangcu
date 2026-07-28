"use client";

import { useEffect, useState } from "react";

type Mapping = { planCode: string; productId: string; enabled: boolean };
type Config = { apiKey: string; webhookSecret: string; configured: boolean; server: "test" | "prod"; productMappings: Mapping[] };

export function CreemConfigForm() {
  const [config, setConfig] = useState<Config>({ apiKey: "", webhookSecret: "", configured: false, server: "test", productMappings: [] });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetch("/api/admin/creem").then((response) => response.json()).then((json) => setConfig({ ...json.data, apiKey: "", webhookSecret: "" })).finally(() => setLoading(false)); }, []);
  function updateMapping(index: number, patch: Partial<Mapping>) { setConfig((current) => ({ ...current, productMappings: current.productMappings.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item) })); }
  async function save() {
    setMessage("");
    const csrf = await fetch("/api/admin/csrf").then((response) => response.json());
    const response = await fetch("/api/admin/creem", { method: "POST", headers: { "content-type": "application/json", "x-csrf-token": csrf.data?.token || "" }, body: JSON.stringify(config) });
    const json = await response.json();
    setMessage(response.ok ? "Đã lưu cấu hình Creem." : json.error?.message || "Lưu thất bại.");
    if (response.ok) setConfig(json.data);
  }
  if (loading) return <p className="p-6 text-sm text-slate-500">Đang tải cấu hình Creem...</p>;
  return <section className="space-y-6 p-6">
    <div><p className="text-sm font-medium text-blue-600">Payments</p><h1 className="mt-2 text-3xl font-semibold">Creem configuration</h1><p className="mt-2 text-sm text-slate-600">API secret được lưu server-side và chỉ hiển thị dạng che.</p></div>
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <label className="text-sm">API key<input className="mt-2 w-full rounded-xl border p-3" value={config.apiKey} onChange={(e) => setConfig({ ...config, apiKey: e.target.value })} placeholder="Để trống để giữ secret hiện tại" /></label>
        <label className="text-sm">Webhook secret<input className="mt-2 w-full rounded-xl border p-3" value={config.webhookSecret} onChange={(e) => setConfig({ ...config, webhookSecret: e.target.value })} placeholder="Để trống để giữ secret hiện tại" /></label>
        <label className="text-sm">Server<select className="mt-2 w-full rounded-xl border p-3" value={config.server} onChange={(e) => setConfig({ ...config, server: e.target.value as "test" | "prod" })}><option value="test">Test</option><option value="prod">Production</option></select></label>
      </div>
      <p className="text-xs text-slate-500">Webhook URL: <code>https://hangcu.vercel.app/api/payments/creem/webhook</code></p>
    </div>
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between"><div><h2 className="text-xl font-semibold">Plan to Creem product mapping</h2><p className="text-sm text-slate-500">Mỗi planCode chỉ trỏ tới một productId Creem.</p></div><button type="button" className="rounded-full border px-4 py-2 text-sm" onClick={() => setConfig({ ...config, productMappings: [...config.productMappings, { planCode: "", productId: "", enabled: true }] })}>Thêm mapping</button></div>
      <div className="mt-4 space-y-3">{config.productMappings.map((item, index) => <div key={index} className="grid gap-3 md:grid-cols-[1fr_2fr_auto] items-center"><input className="rounded-xl border p-3" value={item.planCode} placeholder="FULL_1M" onChange={(e) => updateMapping(index, { planCode: e.target.value.toUpperCase() })} /><input className="rounded-xl border p-3" value={item.productId} placeholder="prod_..." onChange={(e) => updateMapping(index, { productId: e.target.value })} /><button type="button" className="text-sm text-rose-600" onClick={() => setConfig({ ...config, productMappings: config.productMappings.filter((_, itemIndex) => itemIndex !== index) })}>Xóa</button></div>)}</div>
    </div>
    <button type="button" onClick={save} className="rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white">Lưu cấu hình Creem</button>{message ? <p className="text-sm text-slate-600">{message}</p> : null}
  </section>;
}
