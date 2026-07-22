import { z } from "zod";
import { getProductBySlug } from "@/modules/products/service";
import { getCurrentPriceForProduct } from "@/modules/prices/service";
import { buildOrderDraftFromProducts, createOrder } from "@/modules/orders/service";
import { createPaymentCheckout } from "@/modules/payments/service";
import { checkoutFormSchema } from "@/modules/checkout/schema";

const schema = checkoutFormSchema.extend({
  productSlug: z.string().min(1),
  provider: z.enum(["payos", "sandbox", "manual"])
});

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);
  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    return Response.json({ success: false, error: { code: "INVALID_REQUEST", message: "Request is invalid." } }, { status: 400 });
  }

  const product = await getProductBySlug(parsed.data.productSlug);
  const price = await getCurrentPriceForProduct(product.id);
  const draft = buildOrderDraftFromProducts({
    customerEmail: parsed.data.email,
    source: "storefront_checkout",
    products: [
      {
        ...product,
        amountMinor: price.amountMinor,
        currency: price.currency
      }
    ],
    notes: parsed.data.notes ?? null
  });

  const order = await createOrder(draft);
  const appBaseUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "";
  const returnUrl = `${appBaseUrl}/checkout?status=success&order=${encodeURIComponent(order.orderNumber)}`;
  const cancelUrl = `${appBaseUrl}/checkout?status=cancelled&order=${encodeURIComponent(order.orderNumber)}`;
  const checkout = await createPaymentCheckout({
    orderId: order.id,
    orderNumber: order.orderNumber,
    amountMinor: order.totalMinor,
    currency: order.currency,
    customerEmail: order.customerEmail,
    provider: parsed.data.provider,
    returnUrl,
    cancelUrl
  });

  return Response.json({
    success: true,
    data: {
      orderNumber: order.orderNumber,
      checkoutUrl: checkout.checkoutUrl,
      provider: parsed.data.provider,
      providerCheckoutId: checkout.providerCheckoutId
    }
  });
}
