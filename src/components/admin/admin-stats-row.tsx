import { SummaryCard } from "@/components/admin/summary-card";

type StatCard = {
  label: string;
  value: string | number;
  tone?: "default" | "blue" | "emerald" | "amber" | "rose" | "violet";
};

type Props = {
  stats: StatCard[];
  className?: string;
};

export function AdminStatsRow({ stats, className = "" }: Props) {
  if (!stats.length) return null;

  const gridClass =
    stats.length <= 1
      ? "xl:grid-cols-1"
      : stats.length === 2
        ? "sm:grid-cols-2 xl:grid-cols-2"
        : stats.length === 3
          ? "sm:grid-cols-2 xl:grid-cols-3"
          : "sm:grid-cols-2 xl:grid-cols-4";

  return <div className={`grid gap-3 ${gridClass} ${className}`.trim()}>{stats.map((stat) => <SummaryCard key={stat.label} label={stat.label} value={stat.value} tone={stat.tone ?? "default"} />)}</div>;
}
