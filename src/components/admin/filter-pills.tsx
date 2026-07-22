import Link from "next/link";

type FilterPill = {
  label: string;
  href: string;
  active?: boolean;
};

type Props = {
  pills: FilterPill[];
  className?: string;
};

export function FilterPills({ pills, className = "" }: Props) {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`.trim()}>
      {pills.map((pill) => (
        <Link
          key={pill.href}
          href={pill.href as any}
          className={`rounded-full px-4 py-2 text-sm font-medium transition ${
            pill.active ? "bg-slate-950 text-white" : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
          }`}
        >
          {pill.label}
        </Link>
      ))}
    </div>
  );
}
