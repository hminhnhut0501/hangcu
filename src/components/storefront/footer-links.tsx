import Link from "next/link";

export function StorefrontFooterLinks() {
  return (
    <footer className="border-t border-slate-200">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-8 text-sm text-slate-600 md:flex-row md:items-start md:justify-between">
        <div className="max-w-xl space-y-3">
          <p className="font-medium text-slate-900">Cửa hàng license cho Hang Cú video.</p>
          <p className="mt-1">Giao key nhanh, hỗ trợ VI / EN, và có đầy đủ trang chính sách.</p>
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
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/refund-policy">Refund</Link>
          <Link href="/license-agreement">License Agreement</Link>
          <Link href="/faq">FAQ</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/about">About</Link>
          <Link href="/pricing">Pricing</Link>
          <Link href="/download">Download</Link>
        </nav>
      </div>
    </footer>
  );
}
