import Link from "next/link";

const pages = [
  { href: "/legal/privacy", labelVi: "Chính sách bảo mật", labelEn: "Privacy Policy" },
  { href: "/legal/terms", labelVi: "Điều khoản sử dụng", labelEn: "Terms of Service" },
  { href: "/legal/refund", labelVi: "Chính sách hoàn tiền", labelEn: "Refund Policy" },
  { href: "/legal/delivery", labelVi: "Chính sách giao hàng", labelEn: "Delivery Policy" },
  { href: "/legal/license-terms", labelVi: "Điều khoản license", labelEn: "License Terms" },
  { href: "/legal/faq", labelVi: "Câu hỏi thường gặp", labelEn: "FAQ" },
  { href: "/legal/contact", labelVi: "Liên hệ", labelEn: "Contact" },
  { href: "/legal/about", labelVi: "Giới thiệu", labelEn: "About" }
];

export default function LegalHubPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <div className="space-y-3">
        <p className="text-sm font-medium uppercase tracking-[0.3em] text-blue-600">Legal</p>
        <h1 className="text-4xl font-semibold tracking-tight">Store policies / Chính sách cửa hàng</h1>
      </div>
      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {pages.map((page) => (
          <Link key={page.href} href={page.href as any} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">{page.labelVi}</p>
            <h2 className="mt-1 text-xl font-semibold">{page.labelEn}</h2>
          </Link>
        ))}
      </div>
    </main>
  );
}
