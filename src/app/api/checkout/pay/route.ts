import { z } from "zod";
import { generateRandomToken } from "@/lib/crypto/hash";
import { getProductBySlug } from "@/modules/products/service";
import { getCurrentPriceForProduct } from "@/modules/prices/service";
import { getLicensePlanByCode } from "@/modules/license-plans/service";
import { createOrder, getOrderByOrderNumber, updateOrder } from "@/modules/orders/service";
import { createPaymentCheckout } from "@/modules/payments/service";
import { checkoutFormSchema } from "@/modules/checkout/schema";
import { getCreemConfig, resolveCreemPlanConfig } from "@/modules/creem-config/service";
import { getCreemProductPricing } from "@/providers/payments/creem";

const schema = checkoutFormSchema.extend({
  productSlug: z.string().min(1).optional(),
  orderNumber: z.string().min(1).optional(),
  botOrderId: z.string().min(1).optional(),
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
    console.warn("[checkout-pay] invalid_request stage=schema", JSON.stringify({
      keys: payload && typeof payload === "object" ? Object.keys(payload as Record<string, unknown>).sort() : [],
      provider: payload && typeof payload === "object" ? (payload as Record<string, unknown>).provider ?? "n/a" : "n/a",
      orderId: payload && typeof payload === "object" ? (payload as Record<string, unknown>).orderId ?? "n/a" : "n/a",
      botOrderId: payload && typeof payload === "object" ? (payload as Record<string, unknown>).botOrderId ?? "n/a" : "n/a",
      issues: parsed.error.issues.map((issue) => ({ path: issue.path, code: issue.code, message: issue.message }))
    }));
    return Response.json({ success: false, error: { code: "INVALID_REQUEST", message: "Request is invalid." } }, { status: 400 });
  }

  let order;
  const isBotCheckout = Boolean(parsed.data.botOrderId || parsed.data.orderNumber || parsed.data.checkoutId || parsed.data.customerRef);
  if (isBotCheckout) {
    const botOrderNumber = parsed.data.botOrderId ?? parsed.data.orderNumber;
    const existingOrder = botOrderNumber ? await getOrderByOrderNumber(botOrderNumber) : null;
    const requestedPlanCode = String(parsed.data.planCode ?? existingOrder?.metadata?.planCode ?? "").trim().toUpperCase();
    const fixedCreemPlan = parsed.data.provider === "creem" ? await resolveCreemPlanConfig(requestedPlanCode) : null;
    let creemPricing = null;
    let creemPricingError = "";
    if (fixedCreemPlan) {
      try {
        creemPricing = await getCreemProductPricing(fixedCreemPlan.productId);
      } catch (error) {
        creemPricingError = error instanceof Error ? error.message : String(error);
      }
    }
    if (parsed.data.provider === "creem") {
      const creemConfig = await getCreemConfig();
      console.info("[creem-checkout] pricing_resolve", JSON.stringify({
        orderNumber: parsed.data.botOrderId ?? parsed.data.orderNumber ?? "n/a",
        requestedPlanCode: requestedPlanCode || "n/a",
        mappedPlanCode: fixedCreemPlan?.planCode ?? "n/a",
        productId: fixedCreemPlan?.productId ?? "n/a",
        amountMinor: creemPricing?.amountMinor ?? 0,
        currency: creemPricing?.currency ?? "n/a",
        mapping: fixedCreemPlan ? "found" : "missing",
        pricing: creemPricing ? "found" : "missing",
        server: creemConfig.server,
        apiKey: creemConfig.apiKey ? "set" : "missing",
        error: creemPricingError || undefined
      }));
    }
    const amountMinor = parsed.data.provider === "creem"
      ? (creemPricing?.amountMinor ?? 0)
      : (parsed.data.amountMinor ?? existingOrder?.totalMinor ?? 0);
    const currency = parsed.data.provider === "creem" ? (creemPricing?.currency ?? "USD") : (parsed.data.currency ?? "VND");
    const planName = parsed.data.plan ?? parsed.data.planCode ?? "Bot checkout";
    const orderNumber = botOrderNumber ?? parsed.data.checkoutId ?? `BOT-${Date.now()}`;
    if (!Number.isFinite(amountMinor) || amountMinor <= 0) {
      console.warn("[checkout-pay] invalid_request stage=amount", JSON.stringify({
        orderNumber,
        botOrderId: parsed.data.botOrderId ?? "n/a",
        provider: parsed.data.provider,
        planCode: requestedPlanCode || "n/a",
        amountMinor,
        currency
      }));
      return Response.json({
        success: false,
        error: { code: "INVALID_REQUEST", message: "Request is invalid." }
      }, { status: 400 });
    }
    const telegramRef = String(parsed.data.customerRef ?? "")
      .replace(/^tg:/i, "")
      .replace(/[^0-9]/g, "");
    const fallbackEmail = telegramRef ? `${telegramRef}@gmail.com` : `${orderNumber.toLowerCase()}@gmail.com`;
    const customerEmail = parsed.data.email?.trim() || fallbackEmail;
    if (existingOrder) {
      order = await updateOrder(existingOrder.orderNumber, {
        customerEmail,
        currency,
        metadata: {
          ...existingOrder.metadata,
          ...(parsed.data.email ? { customerEmail } : {}),
          planCode: requestedPlanCode || null,
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
        orderNumber: botOrderNumber ?? null,
        botOrderId: parsed.data.botOrderId ?? botOrderNumber ?? null,
        planCode: requestedPlanCode || null,
        requestedPlanCode: requestedPlanCode || null,
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
          productId: requestedPlanCode || orderNumber,
          sku: requestedPlanCode || orderNumber,
          productName: planName,
          quantity: 1,
          unitAmountMinor: amountMinor,
          totalAmountMinor: amountMinor,
          productSnapshot: {
            name: planName,
            slug: requestedPlanCode || orderNumber,
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
      console.warn("[checkout-pay] invalid_request stage=storefront_fields", JSON.stringify({
        provider: parsed.data.provider,
        productSlug: parsed.data.productSlug ?? "n/a",
        hasEmail: Boolean(parsed.data.email)
      }));
      return Response.json({ success: false, error: { code: "INVALID_REQUEST", message: "Request is invalid." } }, { status: 400 });
    }
    let product;
    try {
      product = await getProductBySlug(parsed.data.productSlug);
    } catch (error) {
      const licensePlan = await getLicensePlanByCode(parsed.data.planCode ?? parsed.data.productSlug);
      if (!licensePlan) throw error;
      const requestedCurrency = parsed.data.currency;
      const currency = requestedCurrency ?? (licensePlan.currencyPrices.VND != null ? "VND" : "USD");
      const amountMinor = currency === "VND"
        ? Math.round(licensePlan.currencyPrices.VND ?? 0)
        : Math.round((licensePlan.currencyPrices.USD ?? 0) * 100);
      product = {
        id: licensePlan.id,
        slug: licensePlan.code,
        sku: licensePlan.code,
        name: licensePlan.name,
        shortDescription: licensePlan.description,
        status: licensePlan.status,
        downloadLimit: 0,
        downloadExpiryDays: 0,
        licensePrice: { currency, amountMinor }
      };
    }
    const price = "licensePrice" in product
      ? product.licensePrice
      : await getCurrentPriceForProduct(product.id);
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
    console.warn("[checkout-pay] invalid_request stage=currency", JSON.stringify({
      orderNumber: order.orderNumber,
      provider: parsed.data.provider,
      orderCurrency: order.currency,
      requestedCurrency: parsed.data.currency ?? "n/a"
    }));
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
  if (parsed.data.provider === "creem" && !(parsed.data.planCode ?? order.metadata?.planCode)) {
    return Response.json({
      success: false,
      error: {
        code: "CREEM_CUSTOM_SUPPORT_NOT_SUPPORTED",
        message: "Creem hiện chỉ được bật cho gói cố định, chưa dùng cho ủng hộ tự do."
      }
    }, { status: 400 });
  }
  const creemPlanConfig = parsed.data.provider === "creem"
    ? await resolveCreemPlanConfig(parsed.data.planCode ?? String(order.metadata?.planCode ?? ""))
    : null;
  const creemProductId = creemPlanConfig?.productId ?? "";
  if (parsed.data.provider === "creem" && !creemPlanConfig) {
    return Response.json({
      success: false,
      error: {
        code: "CREEM_PRODUCT_NOT_CONFIGURED",
        message: "Chưa cấu hình product Creem cho gói này."
      }
    }, { status: 400 });
  }
  if (parsed.data.provider === "creem" && (!creemPlanConfig || order.currency !== "USD")) {
    console.warn(
      `[creem-checkout] invalid_product_mapping orderNumber=${order.orderNumber} planCode=${parsed.data.planCode ?? order.metadata?.planCode ?? "n/a"} currency=${order.currency}`
    );
    return Response.json({
      success: false,
      error: { code: "CREEM_PRICE_MISMATCH", message: "Giá gói Creem không khớp cấu hình cố định." }
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

  let checkout;
  try {
    checkout = await createPaymentCheckout({
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
        ...(creemProductId ? {
          creemProductId,
          planCode: creemPlanConfig?.planCode ?? parsed.data.planCode ?? order.metadata?.planCode ?? null,
          creemCurrency: "USD"
        } : {})
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[checkout-pay] provider_failed", JSON.stringify({
      orderNumber: order.orderNumber,
      orderId: order.id,
      provider: parsed.data.provider,
      planCode: parsed.data.planCode ?? order.metadata?.planCode ?? "n/a",
      amountMinor: order.totalMinor,
      currency: order.currency,
      error: message
    }));
    return Response.json({
      success: false,
      error: { code: "PROVIDER_CHECKOUT_FAILED", message: "Unable to create checkout." }
    }, { status: 502 });
  }

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
      botOrderId: parsed.data.botOrderId ?? order.metadata?.botOrderId ?? null,
      checkoutUrl: checkout.checkoutUrl,
      provider: parsed.data.provider,
      providerCheckoutId: checkout.providerCheckoutId,
      providerPaymentId: checkout.providerPaymentId,
      currency: order.currency,
      orderNumberFromBot: parsed.data.orderNumber ?? null
    }
  });
}
