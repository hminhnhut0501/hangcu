import { getCurrentPriceForProduct } from "../prices/service";
import { buildOrderDraftFromProducts, createOrder } from "../orders/service";
import type { CheckoutFormInput } from "./schema";
import { getProductBySlug } from "../products/service";

export async function calculateCheckoutFromSlugs(input: {
  productSlugs: string[];
  form: CheckoutFormInput;
  source?: string;
}) {
  const products = await Promise.all(input.productSlugs.map((slug) => getProductBySlug(slug)));
  const prices = await Promise.all(products.map((product) => getCurrentPriceForProduct(product.id)));

  const enrichedProducts = products.map((product, index) => ({
    ...product,
    amountMinor: prices[index]?.amountMinor ?? product.amountMinor,
    currency: prices[index]?.currency ?? product.currency
  }));

  const draft = buildOrderDraftFromProducts({
    customerEmail: input.form.email,
    source: input.source ?? "storefront_checkout",
    products: enrichedProducts,
    notes: input.form.notes ?? null
  });

  const order = await createOrder(draft);

  return {
    itemsCount: enrichedProducts.length,
    subtotalMinor: order.subtotalMinor,
    discountMinor: order.discountMinor,
    totalMinor: order.totalMinor,
    currency: order.currency,
    order
  };
}
