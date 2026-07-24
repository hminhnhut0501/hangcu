import Link from "next/link";

export function StorefrontFooterLinks() {
  return (
    <footer className="border-t border-slate-200">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-8 text-sm text-slate-600 md:flex-row md:items-center md:justify-between">
        <div className="max-w-xl">
          <p className="font-medium text-slate-900">Hang Cú video license store for macOS.</p>
          <p className="mt-1">Instant delivery, bilingual support, and clear policy pages for product review.</p>
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
