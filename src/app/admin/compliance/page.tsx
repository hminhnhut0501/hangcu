import Link from "next/link";

const complianceItems = [
  {
    title: "Phủ chính sách",
    status: "Sẵn sàng",
    description: "Privacy, Terms, Refund, Delivery, License Terms, FAQ, Contact, About, and Merchant pages are live and linked in the footer."
  },
  {
    title: "Công bố hàng số",
    status: "Sẵn sàng",
    description: "The storefront clearly states that this is a software license store with instant digital delivery, not a physical shipment business."
  },
  {
    title: "Quy trình hoàn tiền",
    status: "Sẵn sàng",
    description: "Refund rules are narrow and explicit: billing errors, duplicate charges, or delivery failures."
  },
  {
    title: "Hiển thị hỗ trợ",
    status: "Sẵn sàng",
    description: "Support contact is visible across policy pages and merchant copy for billing, delivery, and license issues."
  },
  {
    title: "Storefront song ngữ",
    status: "Sẵn sàng",
    description: "Key customer-facing pages support Vietnamese and English to reduce confusion during provider review."
  },
  {
    title: "Bộ hồ sơ chứng minh",
    status: "Chờ",
    description: "Prepare screenshots, a full test purchase recording, payout details, and business identity info before submission."
  }
];

const evidencePack = [
  "Company or merchant identity details",
  "Payout account ownership proof",
  "Screenshots of homepage, checkout, and legal pages",
  "A test order recording showing checkout, payment, and delivery",
  "Customer support email and response process",
  "Refund and license revocation policy excerpts"
];

const providerReadiness = [
  {
    provider: "PayPal",
    points: [
      "Show clear product description and delivery method.",
      "Keep refund policy visible and consistent across pages.",
      "Avoid ambiguity around subscriptions vs one-time license sales."
    ]
  },
  {
    provider: "Lemon Squeezy",
    points: [
      "Explain the product as digital software licenses.",
      "Document who receives the license and how it is redeemed.",
      "Keep merchant contact and policy links easy to find."
    ]
  }
];

export default function AdminCompliancePage() {
  return (
    <section className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium text-blue-600">Compliance</p>
          <h2 className="mt-3 text-4xl font-semibold tracking-tight">Sẵn sàng cho merchant</h2>
          <p className="mt-2 max-w-3xl text-sm text-slate-600">
            Dùng trang này như checklist trước khi gửi cho PayPal, Lemon Squeezy hoặc bất kỳ bên duyệt nào cần câu chuyện
            hàng số rõ ràng.
          </p>
        </div>
        <Link
          href="/legal"
        className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
      >
        Mở khu pháp lý
        </Link>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {complianceItems.map((item) => (
          <article key={item.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{item.description}</p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  item.status === "Ready" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                }`}
              >
                {item.status}
              </span>
            </div>
          </article>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-blue-600">Hồ sơ chứng minh</p>
              <h3 className="mt-2 text-xl font-semibold">Cần chuẩn bị gì để duyệt</h3>
            </div>
            <p className="text-xs text-slate-500">Chuẩn bị trước khi nộp hồ sơ</p>
          </div>
          <ul className="mt-5 space-y-3 text-sm text-slate-600">
            {evidencePack.map((item) => (
              <li key={item} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                {item}
              </li>
            ))}
          </ul>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-blue-600">Ghi chú nhà cung cấp</p>
              <h3 className="mt-2 text-xl font-semibold">Bên duyệt thường cần gì</h3>
            </div>
            <p className="text-xs text-slate-500">Đồng bộ nội dung trước khi gửi</p>
          </div>
          <div className="mt-5 space-y-4">
            {providerReadiness.map((provider) => (
              <div key={provider.provider} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <h4 className="text-sm font-semibold text-slate-500">{provider.provider}</h4>
                <ul className="mt-3 space-y-2 text-sm text-slate-600">
                  {provider.points.map((point) => (
                    <li key={point} className="rounded-xl border border-white/60 bg-white px-3 py-2 shadow-sm">
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </article>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <article className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold">Câu chuyện merchant</h3>
          <p className="mt-3 text-sm text-slate-600">
            The site sells digital software licenses for Hang Cú video with instant electronic delivery, bilingual storefront
            content, visible support contact, and a refund policy limited to clear failure cases.
          </p>
        </article>
        <article className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold">Việc tiếp theo</h3>
          <p className="mt-3 text-sm text-slate-600">
            Capture screenshots of the live checkout flow, copy the support email and business identity into one review packet,
            then submit the application only after the legal pages and merchant narrative are unchanged.
          </p>
        </article>
      </div>
    </section>
  );
}
