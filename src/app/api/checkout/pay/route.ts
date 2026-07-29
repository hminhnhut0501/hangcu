import { z } from "zod";
import { generateRandomToken } from "@/lib/crypto/hash";
import { getProductBySlug } from "@/modules/products/service";
import { getCurrentPriceForProduct } from "@/modules/prices/service";
import { createOrder, getOrderByOrderNumber, updateOrder } from "@/modules/orders/service";
import { createPaymentCheckout } from "@/modules/payments/service";
import { checkoutFormSchema } from "@/modules/checkout/schema";
import { resolveCreemProductIdFromConfig } from "@/modules/creem-config/service";

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
  provider: z.enum(["payos", "paypal", "lemonsqueezy", "creem", "sandbox", "manual"])
});

function generatePayosOrderCode() {
  const base = Date.now() % 1_000_000_000_000;
  const randomPart = Number(generateRandomToken(3).replace(/\D/g, "").padEnd(3, "7").slice(0, 3));
  const candidate = base * 1000 + randomPart;
  return Number.isSafeInteger(candidate) && candidate > 0 ? candidate : Math.floor(Math.random() * 1_000_000_000_000_000) + 1;
}

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);
  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    return Response.json({ success: false, error: { code: "INVALID_REQUEST", message: "Request is invalid." } }, { status: 400 });
  }

  let order;
  const isBotCheckout = Boolean(parsed.data.orderNumber || parsed.data.checkoutId || parsed.data.customerRef);
  if (isBotCheckout) {
    const existingOrder = parsed.data.orderNumber ? await getOrderByOrderNumber(parsed.data.orderNumber) : null;
    const amountMinor = parsed.data.amountMinor ?? existingOrder?.totalMinor ?? 0;
    const currency = parsed.data.currency ?? "VND";
    const planName = parsed.data.plan ?? parsed.data.planCode ?? "Bot checkout";
    const orderNumber = parsed.data.orderNumber ?? parsed.data.checkoutId ?? `BOT-${Date.now()}`;
    if (!Number.isFinite(amountMinor) || amountMinor <= 0) {
      return Response.json({
        success: false,
        error: { code: "INVALID_REQUEST", message: "Request is invalid." }
      }, { status: 400 });
    }
    const customerEmail = parsed.data.email?.trim() || `${parsed.data.customerRef ?? orderNumber}@hangcu.local`;
    if (existingOrder) {
      order = await updateOrder(existingOrder.orderNumber, {
        customerEmail,
        currency,
        metadata: {
          ...existingOrder.metadata,
          ...(parsed.data.email ? { customerEmail } : {}),
          planCode: parsed.data.planCode ?? existingOrder.metadata?.planCode ?? null,
          planName: parsed.data.plan ?? existingOrder.metadata?.planName ?? planName,
          amountMinor,
          currency
        }
      });
    } else {
      order = await createOrder({
      customerEmail,
      currency,
      source: "bot_checkout",
      notes: null,
      metadata: {
        source: "prive_bot",
        integrationSource: "bot_checkout",
        orderNumber: parsed.data.orderNumber ?? null,
        planCode: parsed.data.planCode ?? null,
        requestedPlanCode: parsed.data.planCode ?? null,
        planName,
        amountLabel: parsed.data.amountLabel ?? null,
        amountMinor,
        currency,
        customerRef: parsed.data.customerRef ?? null,
        checkoutId: parsed.data.checkoutId ?? null,
        paymentSessionId: parsed.data.checkoutId ?? null,
        checkoutProvider: parsed.data.provider,
        checkoutKind: "bot"
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
    }
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
        productSlug: product.slug,
        checkoutKind: "storefront",
        checkoutProvider: parsed.data.provider
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
  if (!order) {
    return Response.json({ success: false, error: { code: "ORDER_NOT_FOUND", message: "Order could not be prepared." } }, { status: 404 });
  }
  const appBaseUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "";
  if (["paypal", "lemonsqueezy", "creem"].includes(parsed.data.provider) && order.currency !== "USD") {
    return Response.json({
      success: false,
      error: { code: "INVALID_CURRENCY", message: parsed.data.provider === "creem" ? "Creem chỉ hỗ trợ thanh toán USD." : "PayPal và Lemon Squeezy chỉ hỗ trợ thanh toán USD." }
    }, { status: 400 });
  }
  const returnUrl = `${appBaseUrl}/checkout?status=success&order=${encodeURIComponent(order.orderNumber)}`;
  const cancelUrl = `${appBaseUrl}/checkout?status=cancelled&order=${encodeURIComponent(order.orderNumber)}`;

  const existingCheckoutUrl = String(order.metadata?.paymentCheckoutUrl ?? "").trim();
  const existingPayosOrderCode = String(order.metadata?.payosOrderCode ?? "").trim();
  if (parsed.data.provider === "payos" && existingCheckoutUrl && existingPayosOrderCode) {
    return Response.json({
      success: true,
      data: {
        orderNumber: order.orderNumber,
        checkoutUrl: existingCheckoutUrl,
        provider: parsed.data.provider,
        providerCheckoutId: String(order.metadata?.providerCheckoutId ?? ""),
        orderNumberFromBot: parsed.data.orderNumber ?? null
      }
    });
  }

  const metadataProviderCheckoutId = String(order.metadata?.providerCheckoutId ?? "").trim() || null;
  const metadataPayosOrderCode = String(order.metadata?.payosOrderCode ?? "").trim() || null;
  const metadataProviderPaymentId = String(order.metadata?.providerPaymentId ?? "").trim() || null;
  if (parsed.data.provider === "creem" && !parsed.data.planCode) {
    return Response.json({
      success: false,
      error: {
        code: "CREEM_CUSTOM_SUPPORT_NOT_SUPPORTED",
        message: "Creem hiện chỉ được bật cho gói cố định, chưa dùng cho ủng hộ tự do."
      }
    }, { status: 400 });
  }
  const creemProductId = parsed.data.provider === "creem" ? await resolveCreemProductIdFromConfig(parsed.data.planCode ?? order.metadata?.planCode as string | undefined) : "";
  if (parsed.data.provider === "creem" && !creemProductId) {
    return Response.json({
      success: false,
      error: {
        code: "CREEM_PRODUCT_NOT_CONFIGURED",
        message: "Chưa cấu hình product Creem cho gói này."
      }
    }, { status: 400 });
  }
  const payosOrderCode =
    parsed.data.provider === "payos"
      ? metadataPayosOrderCode || String(generatePayosOrderCode())
      : null;

  if (parsed.data.provider === "payos") {
    console.info(
      `[payos-checkout] orderNumber=${order.orderNumber} orderId=${order.id} payosOrderCode=${payosOrderCode}`
    );
    await updateOrder(order.orderNumber, {
      metadata: {
        ...order.metadata,
        payosOrderCode,
        paymentProvider: parsed.data.provider
      },
      paymentProvider: parsed.data.provider,
      providerCheckoutId: metadataProviderCheckoutId,
      providerOrderId: payosOrderCode
    });
  }

  const checkout = await createPaymentCheckout({
    orderId: order.id,
    orderNumber: order.orderNumber,
    amountMinor: order.totalMinor,
    currency: order.currency,
    customerEmail: order.customerEmail,
    provider: parsed.data.provider,
    returnUrl,
    cancelUrl,
    metadata: {
      ...(payosOrderCode ? { payosOrderCode } : {}),
      ...(creemProductId ? { creemProductId, planCode: parsed.data.planCode ?? order.metadata?.planCode ?? null } : {})
    }
  });

  await updateOrder(order.orderNumber, {
    paymentProvider: parsed.data.provider,
    providerCheckoutId: checkout.providerCheckoutId ?? metadataProviderCheckoutId ?? null,
    providerOrderId: payosOrderCode ?? metadataPayosOrderCode ?? null,
    providerPaymentId: checkout.providerPaymentId ?? metadataProviderPaymentId ?? null,
    paymentReceiptUrl: checkout.checkoutUrl,
    paymentRecordedAt: new Date().toISOString(),
    lastPaymentEventAt: new Date().toISOString(),
    metadata: {
      ...order.metadata,
      paymentProvider: parsed.data.provider,
      paymentCheckoutUrl: checkout.checkoutUrl,
      providerCheckoutId: checkout.providerCheckoutId,
      payosOrderCode: payosOrderCode ?? checkout.providerPaymentId ?? metadataPayosOrderCode,
      checkoutKind: order.metadata?.checkoutKind ?? (parsed.data.orderNumber || parsed.data.planCode ? "bot" : "storefront"),
      checkoutProvider: parsed.data.provider
    }
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
