type SummaryCardProps = {
  label: string;
  value: string | number;
  tone?: "default" | "blue" | "emerald" | "amber" | "rose";
  className?: string;
};

const toneStyles: Record<NonNullable<SummaryCardProps["tone"]>, string> = {
  default: "border-slate-200 bg-white text-slate-950",
  blue: "border-blue-200 bg-blue-50 text-slate-950",
  emerald: "border-emerald-200 bg-emerald-50 text-slate-950",
  amber: "border-amber-200 bg-amber-50 text-slate-950",
  rose: "border-rose-200 bg-rose-50 text-slate-950"
};

export function SummaryCard({ label, value, tone = "default", className = "" }: SummaryCardProps) {
  return (
    <article className={`rounded-2xl border px-4 py-3 shadow-sm ${toneStyles[tone]} ${className}`.trim()}>
      <p className="text-xs font-medium text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </article>
  );
}
