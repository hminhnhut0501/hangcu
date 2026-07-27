import type { FormEventHandler, ReactNode } from "react";

type Props = {
  children: ReactNode;
  actions?: ReactNode;
  className?: string;
  asForm?: boolean;
  onSubmit?: FormEventHandler<HTMLFormElement>;
  method?: "get" | "post";
};

export function AdminFilterBar({ children, actions, className = "", asForm = false, onSubmit, method = "get" }: Props) {
  const classNameValue = `rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_10px_35px_rgba(15,23,42,0.05)] ${className}`.trim();

  if (asForm) {
    return (
      <form onSubmit={onSubmit} method={method} className={classNameValue}>
        <div className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">{children}</div>
          {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
        </div>
      </form>
    );
  }

  return (
    <div className={classNameValue}>
      <div className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-end">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">{children}</div>
        {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
    </div>
  );
}
