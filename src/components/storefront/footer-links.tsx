import Link from "next/link";

export function StorefrontFooterLinks() {
  return (
    <footer className="border-t border-slate-200">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-8 text-sm text-slate-600 md:flex-row md:items-center md:justify-between">
        <div className="max-w-xl">
          <p className="font-medium text-slate-900">Digital license store for Hang Cú video.</p>
          <p className="mt-1">Instant delivery, bilingual support, and clear policy pages for customer and merchant review.</p>
        </div>
        <nav className="flex flex-wrap gap-4">
          <Link href="/legal/privacy">Privacy</Link>
          <Link href="/legal/terms">Terms</Link>
          <Link href="/legal/refund">Refund</Link>
          <Link href="/legal/delivery">Delivery</Link>
          <Link href="/legal/license-terms">License Terms</Link>
          <Link href="/legal/faq">FAQ</Link>
          <Link href="/legal/contact">Contact</Link>
          <Link href="/legal/about">About</Link>
          <Link href="/legal/merchant">Merchant</Link>
          <Link href="/admin/compliance">Compliance</Link>
        </nav>
      </div>
    </footer>
  );
}
