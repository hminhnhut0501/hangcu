import Link from "next/link";
import { getSiteContentSettings } from "@/modules/site-settings/service";

export default async function StorefrontLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSiteContentSettings();

  return (
    <div className="min-h-screen bg-white text-slate-950">
      <header className="border-b border-slate-200">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-sm font-semibold tracking-wide">
            {settings.siteNameEn}
          </Link>
          <nav className="flex items-center gap-6 text-sm text-slate-600">
            {settings.navigation.filter((item) => item.visible).map((item) => (
              <Link key={item.href} href={item.href as any}>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      {children}
    </div>
  );
}
