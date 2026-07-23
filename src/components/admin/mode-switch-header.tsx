import Link from "next/link";

type ModeOption = {
  key: string;
  label: string;
  href: string;
};

type Props = {
  modeLabel?: string;
  currentMode: string;
  options: ModeOption[];
  hint?: string;
};

export function ModeSwitchHeader({ modeLabel = "Chế độ UI:", currentMode, options, hint }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 text-sm shadow-sm">
      <span className="text-xs font-semibold text-slate-500">{modeLabel}</span>
      {options.map((option) => {
        const active = option.key === currentMode;
        return (
          <Link
            key={option.key}
            href={option.href as any}
            className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-medium transition ${
              active ? "bg-slate-950 text-white shadow-sm" : "border border-slate-200 bg-slate-50 text-slate-700 hover:bg-white"
            }`}
          >
            {option.label}
          </Link>
        );
      })}
      {hint ? <span className="text-slate-500">{hint}</span> : null}
    </div>
  );
}
