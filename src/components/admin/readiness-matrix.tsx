import type { Route } from "next";
import Link from "next/link";
import { AdminDrawer } from "@/components/admin/admin-drawer";
import { AdminPanel } from "@/components/admin/admin-shell";
import { AdminStatusBadge } from "@/components/admin/admin-status-badge";
import { CopyButton } from "@/components/admin/copy-button";

type MatrixItem = {
  title: string;
  status: "ready" | "pending" | "attention";
  description: string;
  details: string[];
};

type Props = {
  title: string;
  eyebrow: string;
  description: string;
  summary: Array<{ label: string; value: string; tone?: "default" | "blue" | "emerald" | "amber" | "rose" | "violet" }>;
  items: MatrixItem[];
  actions?: Array<{ label: string; href: Route }>;
  packetText: string;
};

export function ReadinessMatrix({ title, eyebrow, description, summary, items, actions = [], packetText }: Props) {
  const summaryToneStyles: Record<NonNullable<Props["summary"][number]["tone"]>, string> = {
    default: "bg-slate-50 text-slate-700 ring-slate-200",
    blue: "bg-blue-50 text-blue-700 ring-blue-200",
    emerald: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    amber: "bg-amber-50 text-amber-700 ring-amber-200",
    rose: "bg-rose-50 text-rose-700 ring-rose-200",
    violet: "bg-violet-50 text-violet-700 ring-violet-200"
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium text-blue-600">{eyebrow}</p>
          <h2 className="mt-3 text-4xl font-semibold tracking-tight">{title}</h2>
          <p className="mt-2 max-w-3xl text-sm text-slate-600">{description}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {actions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
            >
              {action.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summary.map((card) => (
          <AdminPanel key={card.label} className={`space-y-3 ${summaryToneStyles[card.tone ?? "default"]}`}>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">{card.label}</p>
            <p className="text-2xl font-semibold text-slate-950">{card.value}</p>
          </AdminPanel>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {items.map((item) => (
          <AdminPanel key={item.title} className="space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-slate-950">{item.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{item.description}</p>
              </div>
              <AdminStatusBadge
                label={item.status === "ready" ? "Sẵn sàng" : item.status === "attention" ? "Cần xem lại" : "Chờ"}
                tone={item.status === "ready" ? "emerald" : item.status === "attention" ? "amber" : "neutral"}
              />
            </div>
            <AdminDrawer
              trigger={<button type="button" className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700">Xem chi tiết</button>}
              title={item.title}
              description={item.description}
            >
              <div className="space-y-4">
                <ul className="space-y-2 text-sm text-slate-600">
                  {item.details.map((detail) => (
                    <li key={detail} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>
            </AdminDrawer>
          </AdminPanel>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <AdminPanel className="space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-600">Review packet</p>
            <h3 className="mt-3 text-xl font-semibold text-slate-950">Bộ hồ sơ nộp merchant</h3>
            <p className="mt-2 text-sm text-slate-600">Chuẩn bị sẵn nội dung để gửi cho provider hoặc reviewer.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <CopyButton value={packetText} label="Copy review packet" />
            <Link href="/legal" className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50">
              Mở legal hub
            </Link>
          </div>
        </AdminPanel>

        <AdminPanel className="space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-600">Quick links</p>
            <h3 className="mt-3 text-xl font-semibold text-slate-950">Nhảy nhanh sang màn cần sửa</h3>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {actions.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-white"
              >
                {action.label}
              </Link>
            ))}
          </div>
        </AdminPanel>
      </div>
    </div>
  );
}
