"use client";

import { useState } from "react";

type SessionRole = "super_admin" | "admin" | "support" | "content_manager" | "viewer";

const roleOptions: Array<{ label: string; value: SessionRole; description: string }> = [
  { label: "Content manager", value: "content_manager", description: "Đủ quyền sửa nội dung, media và các màn content." },
  { label: "Admin", value: "admin", description: "Đủ quyền cho hầu hết mutation admin." },
  { label: "Super admin", value: "super_admin", description: "Toàn quyền cao nhất." },
  { label: "Support", value: "support", description: "Quyền hỗ trợ, thấp hơn admin." },
  { label: "Viewer", value: "viewer", description: "Chỉ xem, không mutate." }
];

async function readJson(response: Response) {
  const json = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(json?.error?.message ?? json?.message ?? `Request failed (${response.status})`);
  }
  return json as any;
}

export default function AdminLoginTestPage() {
  const [role, setRole] = useState<SessionRole>("content_manager");
  const [adminId, setAdminId] = useState("admin_local");
  const [status, setStatus] = useState("");

  async function setSession() {
    setStatus("Đang set session...");
    try {
      await readJson(
        await fetch("/api/admin/session-test", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ adminId, role }),
          credentials: "include"
        })
      );
      setStatus(`Đã set admin_session với role ${role}.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Set session thất bại.");
    }
  }

  async function clearSession() {
    setStatus("Đang xoá session...");
    try {
      await readJson(
        await fetch("/api/admin/session-test", {
          method: "DELETE",
          credentials: "include"
        })
      );
      setStatus("Đã xoá admin_session.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Xoá session thất bại.");
    }
  }

  return (
    <section className="space-y-8">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.3em] text-blue-600">Test login</p>
        <h2 className="mt-3 text-4xl font-semibold tracking-tight">Đăng nhập admin test</h2>
        <p className="mt-2 max-w-3xl text-sm text-slate-600">
          Dùng trang này để set nhanh cookie <code>admin_session</code> mà không cần luồng đăng nhập thật.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_10px_35px_rgba(15,23,42,0.05)]">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Admin ID</span>
              <input
                value={adminId}
                onChange={(event) => setAdminId(event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Role</span>
              <select
                value={role}
                onChange={(event) => setRole(event.target.value as SessionRole)}
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
              >
                {roleOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={setSession}
              className="rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white hover:bg-slate-800"
            >
              Set admin_session
            </button>
            <button
              type="button"
              onClick={clearSession}
              className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Xoá session
            </button>
          </div>

          <p className="mt-4 text-sm text-slate-600">{status}</p>
        </article>

        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_10px_35px_rgba(15,23,42,0.05)]">
          <h3 className="text-lg font-semibold">Gợi ý dùng nhanh</h3>
          <ul className="mt-4 space-y-3 text-sm text-slate-600">
            {roleOptions.map((option) => (
              <li key={option.value} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="font-medium text-slate-900">{option.label}</p>
                <p className="mt-1">{option.description}</p>
              </li>
            ))}
          </ul>
        </article>
      </div>
    </section>
  );
}
