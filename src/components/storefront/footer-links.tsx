import Link from "next/link";

export function StorefrontFooterLinks() {
  const footerLinks = [
    { href: "/privacy", label: "Privacy" },
    { href: "/terms", label: "Terms" },
    { href: "/refund-policy", label: "Refund" },
    { href: "/license-agreement", label: "License Agreement" },
    { href: "/faq", label: "FAQ" },
    { href: "/contact", label: "Contact" },
    { href: "/about", label: "About" },
    { href: "/pricing", label: "Pricing" },
    { href: "/download", label: "Download" }
  ];

  return (
    <footer className="border-t border-slate-200">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-8 text-sm text-slate-600 md:flex-row md:items-start md:justify-between">
        <div className="max-w-xl space-y-3">
          <p className="font-medium text-slate-900">Cửa hàng license cho Hang Cú video.</p>
          <div className="flex flex-wrap gap-4 text-slate-700">
            <a href="mailto:hangcuvip@gmail.com" className="hover:text-slate-950">
              Hỗ trợ: hangcuvip@gmail.com
            </a>
            <a href="https://t.me/cuhotro_bot" target="_blank" rel="noreferrer" className="hover:text-slate-950">
              Telegram: t.me/cuhotro_bot
            </a>
          </div>
        </div>
        <nav className="flex flex-wrap gap-4">
          {footerLinks.map((item) => (
            <Link key={item.href} href={item.href as any}>
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
