"use client";

import Link from "next/link";
import Image from "next/image";
import { ChevronRight, MenuSquare, Package, ShoppingCart } from "lucide-react";
import { usePathname } from "next/navigation";
import { LanguageSwitcher } from "@/components/storefront/language-switcher";

export type StorefrontHeaderItem = {
  label: string;
  href: string;
  active?: boolean;
  tone?: "default" | "primary" | "accent";
};

type Props = {
  siteName: string;
  logoAlt: string;
  items: StorefrontHeaderItem[];
  locale: "vi" | "en";
};

const checkoutPrimaryItems = new Set(["/orders"]);

function IconForHref({ href }: { href: string }) {
  if (href === "/products") return <Package className="h-3.5 w-3.5" />;
  if (href === "/checkout") return <ShoppingCart className="h-3.5 w-3.5" />;
  if (href === "/orders") return <MenuSquare className="h-3.5 w-3.5" />;
  return <ChevronRight className="h-3.5 w-3.5" />;
}

export function StorefrontHeader({ siteName, logoAlt, items, locale }: Props) {
  const pathname = usePathname();
  const isCheckout = pathname === "/checkout";
  const visibleItems = isCheckout ? items.filter((item) => checkoutPrimaryItems.has(item.href)) : items;

  return (
    <header className="border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85">
      <div className={`mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 ${isCheckout ? "py-3" : "flex-col py-4 lg:flex-row"}`}>
        <Link href="/" className="flex items-center gap-3 text-sm font-semibold text-slate-950">
          <Image src="/brand/hangcuvideo-logo.png" alt={logoAlt} width={28} height={28} className="h-7 w-7 rounded-full" priority />
          <span>{siteName}</span>
        </Link>

        <div className={`flex items-center gap-3 ${isCheckout ? "ml-auto" : "flex-col lg:flex-row lg:gap-4"}`}>
          <nav className={`flex flex-wrap items-center gap-2 ${isCheckout ? "justify-end" : "lg:flex-nowrap"}`}>
            {visibleItems.map((item, index) => {
              const active = item.active ?? pathname === item.href;
              const highlight = item.href === "/download";
              return (
                <Link
                  key={item.href}
                  href={item.href as any}
                  className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-2 text-sm font-medium transition ${
                    isCheckout
                      ? active
                        ? "bg-slate-950 text-white shadow-sm hover:bg-slate-800"
                        : "border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                      : active
                        ? "bg-slate-950 text-white shadow-sm hover:bg-slate-800"
                        : highlight
                          ? "border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                  }`}
                >
                  <IconForHref href={item.href} />
                  <span>{item.label}</span>
                  {!active ? <ChevronRight className={`h-3.5 w-3.5 ${highlight ? "opacity-70" : "opacity-50"}`} /> : null}
                </Link>
              );
            })}
          </nav>
          <div className={isCheckout ? "shrink-0" : "self-start lg:self-auto"}>
            <LanguageSwitcher currentLocale={locale} />
          </div>
        </div>
      </div>
    </header>
  );
}
