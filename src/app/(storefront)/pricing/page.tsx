import Link from "next/link";
import { listFeaturedProducts } from "@/modules/products/service";
import { getCurrentPriceForProduct } from "@/modules/prices/service";
import { getStorefrontLocale } from "@/modules/i18n/storefront";
import { StaticPage } from "@/components/storefront/static-page";

export default async function PricingPage() {
  const locale = await getStorefrontLocale();
  const products = await listFeaturedProducts();
  const plans = await Promise.all(products.slice(0, 2).map(async (product) => ({ product, price: await getCurrentPriceForProduct(product.id) })));
  const vi = locale === "vi";
  return (
    <StaticPage
      eyebrow={vi ? "Bảng giá" : "Pricing"}
      title={vi ? "Chọn gói license phù hợp" : "Choose the right license plan"}
      intro={vi ? "Thanh toán một lần và nhận license key qua email." : "Pay once and receive the license key by email."}
      sections={[]}
      footer={
        <div className="space-y-8">
          <div className="grid gap-6 md:grid-cols-2">
            {plans.map(({ product, price }) => (
              <article key={product.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-xs font-semibold text-slate-500">{product.sku}</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-950">{product.name}</h2>
                <p className="mt-2 text-slate-600">{product.shortDescription}</p>
                <p className="mt-5 text-3xl font-semibold text-slate-950">${(price.amountMinor / 100).toFixed(2)}</p>
                <ul className="mt-3 space-y-1 text-sm text-slate-500">
                  <li>{product.downloadExpiryDays === 30 ? (vi ? "Không tự động gia hạn" : "No auto-renew") : (vi ? "Không thu phí định kỳ" : "No recurring fee")}</li>
                  <li>{vi ? "License giao qua email" : "License delivered by email"}</li>
                  <li>{vi ? "Giới hạn số thiết bị" : "Device-limited activation"}</li>
                </ul>
                <Link href={`/checkout?planCode=${encodeURIComponent(product.sku)}&plan=${encodeURIComponent(product.name)}&amountMinor=${price.amountMinor}&currency=${encodeURIComponent(price.currency)}`} className="mt-5 inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white">
                  {vi ? "Mua gói này" : "Buy this plan"}
                </Link>
              </article>
            ))}
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-950">{vi ? "Gói hỗ trợ riêng" : "Separate support package"}</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              {vi
                ? "Gói hỗ trợ là khoản ủng hộ tự nguyện, không thay thế việc mua license và không mở khóa tính năng bí mật."
                : "The support package is a voluntary contribution. It does not replace a license purchase and does not unlock secret features."}
            </p>
          </div>
        </div>
      }
    />
  );
}
