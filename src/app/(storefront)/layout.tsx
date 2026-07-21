import Link from "next/link";

export default function StorefrontLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-white text-slate-950">
      <header className="border-b border-slate-200">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-sm font-semibold tracking-wide">
            Hang Cú Video
          </Link>
          <nav className="flex items-center gap-6 text-sm text-slate-600">
            <Link href="/products">Plans</Link>
            <Link href="/collections">Collections</Link>
            <Link href="/checkout">Checkout</Link>
            <Link href="/orders">Orders</Link>
            <Link href="/admin">Admin</Link>
          </nav>
        </div>
      </header>
      {children}
    </div>
  );
}
