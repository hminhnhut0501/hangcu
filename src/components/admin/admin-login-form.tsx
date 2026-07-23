"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  nextUrl: string;
};

async function parseResponse(response: Response) {
  const json = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(json?.error?.message ?? json?.message ?? `Request failed (${response.status})`);
  }
  return json as any;
}

export function AdminLoginForm({ nextUrl }: Props) {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setLoading(true);
    setMessage("");
    try {
      const result = await parseResponse(
        await fetch("/api/admin/login", {
          method: "POST",
          headers: { "content-type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ username, password })
        })
      );
      setMessage(`Đã đăng nhập với role ${result.data.role}.`);
      router.push(nextUrl as any);
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Đăng nhập thất bại.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="min-h-[calc(100vh-2rem)] bg-[radial-gradient(circle_at_top,_#eef6ff,_#f4f7fb_45%,_#eef2f7_100%)] px-4 py-8">
      <div className="mx-auto grid max-w-5xl gap-6 xl:grid-cols-[1fr_0.9fr]">
        <article className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <p className="text-sm font-medium text-blue-600">Admin login</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">Đăng nhập admin</h1>
          <p className="mt-3 max-w-2xl text-sm text-slate-600">
            Nhập tài khoản và mật khẩu admin để set cookie <code>admin_session</code> trước khi vào <code>/admin</code>.
          </p>

          <div className="mt-6 grid gap-4">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Tài khoản</span>
              <input
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                autoComplete="username"
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Mật khẩu</span>
              <input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                type="password"
                autoComplete="current-password"
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
              />
            </label>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleLogin}
              disabled={loading}
              className="rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white disabled:opacity-50"
            >
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>
          </div>

          <p className="mt-4 text-sm text-slate-600">{message}</p>
        </article>

        <article className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <h2 className="text-lg font-semibold">Cách set biến môi trường</h2>
          <ul className="mt-5 space-y-3 text-sm text-slate-600">
            <li>
              `ADMIN_LOGIN_USER`: tài khoản đăng nhập, ví dụ <code>admin</code>
            </li>
            <li>
              `ADMIN_LOGIN_PASSWORD`: mật khẩu đăng nhập
            </li>
            <li>
              `ADMIN_LOGIN_ROLE`: role sau khi đăng nhập, mặc định là <code>content_manager</code>
            </li>
          </ul>
          <p className="mt-5 text-sm text-slate-600">
            Trên Vercel, bạn set các biến này trong <code>Project Settings → Environment Variables</code> cho
            Production/Preview tùy môi trường.
          </p>
        </article>
      </div>
    </section>
  );
}
