import Link from "next/link";

export function StorefrontFooterLinks() {
  return (
    <footer className="border-t border-slate-200">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-8 text-sm text-slate-600 md:flex-row md:items-center md:justify-between">
        <p>Digital license store. Instant delivery via email, dashboard, and bot flow.</p>
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
        </nav>
      </div>
    </footer>
  );
}
