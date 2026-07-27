import type { ReactNode } from "react";

type Props = {
  title: string;
  description?: string;
  action?: ReactNode;
};

export function AdminEmptyState({ title, description, action }: Props) {
  return (
    <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center">
      <p className="text-lg font-semibold text-slate-950">{title}</p>
      {description ? <p className="mt-2 text-sm leading-7 text-slate-600">{description}</p> : null}
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  );
}
