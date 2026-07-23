import { listCoupons } from "@/modules/coupons/service";

export default async function AdminCouponsPage() {
  const coupons = await listCoupons();

  return (
    <section className="space-y-8">
      <div>
        <p className="text-sm font-medium text-blue-600">Coupons</p>
        <h2 className="mt-3 text-4xl font-semibold tracking-tight">Quản lý coupons</h2>
        <p className="mt-2 max-w-3xl text-sm text-slate-600">
          Theo dõi mã giảm giá, kiểu giảm, giá trị và số lượt redeem còn lại.
        </p>
      </div>
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_10px_35px_rgba(15,23,42,0.05)]">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-[#f8fbff] text-left text-slate-500">
            <tr>
              <th className="px-6 py-4 font-medium">Code</th>
              <th className="px-6 py-4 font-medium">Kiểu</th>
              <th className="px-6 py-4 font-medium">Giá trị</th>
              <th className="px-6 py-4 font-medium">Lượt redeem</th>
              <th className="px-6 py-4 font-medium">Trạng thái</th>
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
