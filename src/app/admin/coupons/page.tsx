import { listCoupons } from "@/modules/coupons/service";

export default async function AdminCouponsPage() {
  const coupons = await listCoupons();

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.3em] text-blue-600">
          Coupons
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight">Coupon management</h2>
      </div>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-6 py-4 font-medium">Code</th>
              <th className="px-6 py-4 font-medium">Type</th>
              <th className="px-6 py-4 font-medium">Value</th>
              <th className="px-6 py-4 font-medium">Redemptions</th>
              <th className="px-6 py-4 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {coupons.map((coupon) => (
              <tr key={coupon.id}>
                <td className="px-6 py-4 font-medium">{coupon.code}</td>
                <td className="px-6 py-4">{coupon.type}</td>
                <td className="px-6 py-4">{coupon.value}</td>
                <td className="px-6 py-4">
                  {coupon.redemptionCount}/{coupon.maxRedemptions}
                </td>
                <td className="px-6 py-4">{coupon.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
