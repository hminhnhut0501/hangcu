import { z } from "zod";
import { getProductBySlug } from "@/modules/products/service";
import { getCurrentPriceForProduct } from "@/modules/prices/service";
import { createOrder } from "@/modules/orders/service";
import { createPaymentCheckout } from "@/modules/payments/service";
import { checkoutFormSchema } from "@/modules/checkout/schema";

const schema = checkoutFormSchema.extend({
  productSlug: z.string().min(1).optional(),
  orderNumber: z.string().min(1).optional(),
  planCode: z.string().min(1).optional(),
  plan: z.string().min(1).optional(),
  amountLabel: z.string().min(1).optional(),
  amountMinor: z.coerce.number().int().nonnegative().optional(),
  currency: z.enum(["VND", "USD"]).optional(),
  customerRef: z.string().min(1).optional(),
  checkoutId: z.string().min(1).optional(),
  provider: z.enum(["payos", "sandbox", "manual"])
});

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);
  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    return Response.json({ success: false, error: { code: "INVALID_REQUEST", message: "Request is invalid." } }, { status: 400 });
  }

  let order;
  if (parsed.data.orderNumber || parsed.data.planCode || parsed.data.amountMinor != null || parsed.data.checkoutId) {
    const amountMinor = parsed.data.amountMinor ?? 0;
    const currency = parsed.data.currency ?? "VND";
    const planName = parsed.data.plan ?? parsed.data.planCode ?? "Bot checkout";
    const orderNumber = parsed.data.orderNumber ?? parsed.data.checkoutId ?? `BOT-${Date.now()}`;
    order = await createOrder({
      customerEmail: `${parsed.data.customerRef ?? orderNumber}@hangcu.local`,
      currency,
      source: "bot_checkout",
      notes: null,
      metadata: {
        source: "prive_bot",
        integrationSource: "bot_checkout",
        orderNumber: parsed.data.orderNumber ?? null,
        planCode: parsed.data.planCode ?? null,
        planName,
        amountLabel: parsed.data.amountLabel ?? null,
        amountMinor,
        currency,
        customerRef: parsed.data.customerRef ?? null,
        checkoutId: parsed.data.checkoutId ?? null
      },
      items: [
        {
          productId: parsed.data.planCode ?? orderNumber,
          sku: parsed.data.planCode ?? orderNumber,
          productName: planName,
          quantity: 1,
          unitAmountMinor: amountMinor,
          totalAmountMinor: amountMinor,
          productSnapshot: {
            name: planName,
            slug: parsed.data.planCode ?? orderNumber,
            shortDescription: planName,
            status: "active",
            downloadLimit: 0,
            downloadExpiryDays: 0
          }
        }
      ]
    });
  } else {
    if (!parsed.data.productSlug || !parsed.data.email) {
      return Response.json({ success: false, error: { code: "INVALID_REQUEST", message: "Request is invalid." } }, { status: 400 });
    }
    const product = await getProductBySlug(parsed.data.productSlug);
    const price = await getCurrentPriceForProduct(product.id);
    order = await createOrder({
      customerEmail: parsed.data.email,
      currency: price.currency,
      source: "storefront_checkout",
      notes: parsed.data.notes ?? null,
      metadata: {
        source: "storefront_checkout",
        productSlug: product.slug
      },
      items: [
        {
          productId: product.id,
          sku: product.sku,
          productName: product.name,
          quantity: 1,
          unitAmountMinor: price.amountMinor,
          totalAmountMinor: price.amountMinor,
          productSnapshot: {
            name: product.name,
            slug: product.slug,
            shortDescription: product.shortDescription,
            status: product.status,
            downloadLimit: product.downloadLimit,
            downloadExpiryDays: product.downloadExpiryDays
          }
        }
      ]
    });
  }
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
      providerCheckoutId: checkout.providerCheckoutId,
      orderNumberFromBot: parsed.data.orderNumber ?? null
    }
  });
}
