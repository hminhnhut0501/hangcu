const checklist = [
  {
    title: "Legal pages published",
    status: "Done",
    description: "Privacy, Terms, Refund, Delivery, License Terms, FAQ, Contact, About, and Merchant pages are visible in the footer."
  },
  {
    title: "Digital delivery explained",
    status: "Done",
    description: "The storefront and policy pages say products are digital licenses with instant electronic fulfillment."
  },
  {
    title: "Support contact visible",
    status: "Done",
    description: "Billing, delivery, and dispute questions route to support@hangcu.com."
  },
  {
    title: "Refund rules defined",
    status: "Done",
    description: "Refunds are limited to billing errors, duplicate charges, and delivery failures."
  },
  {
    title: "Merchant narrative",
    status: "Done",
    description: "Merchant page explains what is sold, how it is delivered, and why the model is low-risk for review."
  },
  {
    title: "Evidence for review",
    status: "Pending",
    description: "Add screenshots, company/contact info, and a live test purchase flow before submitting to payment providers."
  }
];

export default function AdminCompliancePage() {
  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.3em] text-blue-600">System</p>
        <h2 className="mt-3 text-4xl font-semibold tracking-tight">Compliance & merchant readiness</h2>
        <p className="mt-2 max-w-3xl text-sm text-slate-600">
          One place to see what the merchant review already covers and what still needs to be prepared before applying for PayPal or Lemon Squeezy approval.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {checklist.map((item) => (
          <article key={item.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{item.description}</p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  item.status === "Done" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                }`}
              >
                {item.status}
              </span>
            </div>
          </article>
        ))}
      </div>

      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-600 shadow-sm">
        Next useful step: attach business registration details, payout account proof, and a full test order recording for provider review.
      </div>
    </section>
  );
}
