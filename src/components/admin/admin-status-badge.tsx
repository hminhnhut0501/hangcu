type AdminStatusBadgeProps = {
  label: string;
  tone?: "neutral" | "blue" | "emerald" | "amber" | "rose" | "violet";
  className?: string;
};

const toneStyles: Record<NonNullable<AdminStatusBadgeProps["tone"]>, string> = {
  neutral: "bg-slate-100 text-slate-700 ring-slate-200",
  blue: "bg-blue-50 text-blue-700 ring-blue-200",
  emerald: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  amber: "bg-amber-50 text-amber-700 ring-amber-200",
  rose: "bg-rose-50 text-rose-700 ring-rose-200",
  violet: "bg-violet-50 text-violet-700 ring-violet-200"
};

export function AdminStatusBadge({ label, tone = "neutral", className = "" }: AdminStatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset ${toneStyles[tone]} ${className}`.trim()}
    >
      {label}
    </span>
  );
}
