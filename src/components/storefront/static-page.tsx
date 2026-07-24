import type { ReactNode } from "react";

type StaticPageProps = {
  eyebrow: string;
  title: string;
  intro: string;
  sections: Array<{
    title: string;
    body?: string;
    list?: string[];
  }>;
  footer?: ReactNode;
};

export function StaticPage({ eyebrow, title, intro, sections, footer }: StaticPageProps) {
  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <div className="space-y-8">
        <header className="space-y-4">
          <p className="text-sm font-medium text-blue-600">{eyebrow}</p>
          <h1 className="text-4xl font-semibold tracking-tight text-slate-950">{title}</h1>
          <p className="max-w-3xl text-lg leading-8 text-slate-600">{intro}</p>
        </header>

        <div className="space-y-4">
          {sections.map((section) => (
            <section key={section.title} className="space-y-4 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-950">{section.title}</h2>
              {section.body ? <p className="text-slate-600 leading-7">{section.body}</p> : null}
              {section.list ? (
                <ul className="space-y-2 text-slate-600">
                  {section.list.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}
        </div>

        {footer ? <div className="pt-2">{footer}</div> : null}
      </div>
    </main>
  );
}
