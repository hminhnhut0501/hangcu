import Link from "next/link";

const hardeningLayers = [
  {
    title: "Xác thực",
    status: "Đang bật",
    description: "Admin access is protected by server-side permission checks before any mutation route can proceed."
  },
  {
    title: "Bảo vệ CSRF",
    status: "Đang bật",
    description: "Mutation forms fetch a CSRF token and submit it with x-csrf-token for admin POST/PATCH/DELETE requests."
  },
  {
    title: "Ghi audit",
    status: "Đang bật",
    description: "Admin and system changes write audit records so support can trace who changed what and when."
  },
  {
    title: "Kiểm tra origin",
    status: "Đang bật",
    description: "Admin CSRF validation only accepts configured application origins in production."
  },
  {
    title: "Chặn theo role",
    status: "Đang bật",
    description: "Minimum-role checks are enforced per mutation area, so content, support, and admin actions can be separated."
  },
  {
    title: "Cơ chế dự phòng",
    status: "Đang bật",
    description: "When Supabase tables are missing in early environments, repositories fall back to in-memory behavior instead of crashing."
  }
];

const nextTasks = [
  "Kiểm tra NEXT_PUBLIC_APP_URL trước khi deploy để origin khớp domain thật.",
  "Giữ CSRF token và admin cookie ở chế độ secure, same-site khi lên production.",
  "Xem export audit log là công cụ hỗ trợ, không phải public endpoint.",
  "Tách role riêng cho content, support và super-admin.",
  "Giữ typecheck và build xanh trong CI trước khi đẩy lên Vercel hoặc VPS."
];

const checklist = [
  { label: "Mutation routes được chặn", value: "Có" },
  { label: "Luồng CSRF token", value: "Có" },
  { label: "Audit logging", value: "Có" },
  { label: "Tách role", value: "Có" },
  { label: "Fallback khi thiếu table", value: "Có" },
  { label: "Admin action public", value: "Không" }
];

export default function AdminHardeningPage() {
  return (
    <section className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.3em] text-blue-600">Hardening</p>
          <h2 className="mt-3 text-4xl font-semibold tracking-tight">Tư thế bảo mật và lớp an toàn</h2>
          <p className="mt-2 max-w-3xl text-sm text-slate-600">
            Trang này tóm tắt các lớp bảo vệ phía server cho admin panel và nhắc lại những bước kiểm tra còn lại trước khi
            phát hành.
          </p>
        </div>
        <Link
          href="/admin/compliance"
        className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
      >
        Mở compliance
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {hardeningLayers.map((layer) => (
          <article key={layer.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold">{layer.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{layer.description}</p>
              </div>
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-800">{layer.status}</span>
            </div>
          </article>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-600">Checklist hardening</p>
              <h3 className="mt-2 text-xl font-semibold">Trạng thái kiểm soát hiện tại</h3>
            </div>
            <p className="text-xs text-slate-500">Checklist sẵn sàng production</p>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {checklist.map((item) => (
              <div key={item.label} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-400">{item.label}</p>
                <p className="mt-2 text-lg font-semibold text-slate-950">{item.value}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-600">Ghi chú vận hành</p>
              <h3 className="mt-2 text-xl font-semibold">Những điểm vẫn cần giữ chặt</h3>
            </div>
            <p className="text-xs text-slate-500">Trước mỗi lần deploy</p>
          </div>
          <ul className="mt-5 space-y-3 text-sm text-slate-600">
            {nextTasks.map((task) => (
              <li key={task} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                {task}
              </li>
            ))}
          </ul>
        </article>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <article className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold">Vì sao quan trọng</h3>
          <p className="mt-3 text-sm text-slate-600">
            Admin panel giờ đã có nhiều lớp bảo vệ, nhưng rủi ro thực tế lớn nhất vẫn là vận hành: cấu hình origin sai, thiếu
            biến môi trường hoặc bỏ qua bước kiểm tra trước deploy.
          </p>
        </article>
        <article className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold">Luồng khuyến nghị</h3>
          <p className="mt-3 text-sm text-slate-600">
            Giữ typecheck, test và build xanh ở local. Xác minh quyền admin trên môi trường đã deploy, kiểm tra CSRF và audit
            log hoạt động rồi mới chuyển sang chỉnh content hoặc commerce.
          </p>
        </article>
      </div>
    </section>
  );
}
