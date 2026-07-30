import { generateRandomToken } from "@/lib/crypto/hash";
import { hashToken, hmacSha256 } from "@/lib/crypto/hash";
import { writeSystemAuditLog } from "@/modules/audit/service";
import { sendTransactionalEmail } from "@/lib/email/service";
import { getAdminMutationContext } from "@/modules/admin-auth/context";
import { createOrder, getOrderByOrderNumber, listAllOrders, updateOrder } from "@/modules/orders/service";
import { licensePlansSeed } from "@/lib/license/mock-data";
import { createPaymentCheckout } from "@/modules/payments/service";
import { getLicensePlanByCode, getLicensePlanById, listLicensePlans } from "@/modules/license-plans/service";
import { getSiteContentSettings, resolvePreferredPaymentGateway } from "@/modules/site-settings/service";
import {
  createLicenseKey,
  getLicenseKeyEntitlements,
  getLicenseKeyStatus,
  revokeLicenseKey
} from "@/modules/license-keys/service";
import { integrationErrors } from "@/modules/integration-api/errors";
import { getIntegrationSecret, verifyIntegrationRequest } from "@/modules/integration-api/service";
import { listLicenseKeys, updateLicenseKeyById } from "@/modules/license-keys/service";
import { enqueuePaymentCallback, markPaymentCallback } from "@/modules/payment-callback-outbox/service";
import { licenseCheckoutSchema, licenseRevokeSchema, licenseStatusSchema, licenseVerifySchema } from "./schema";

function buildBotResponseUrl(url: string | undefined, orderNumber: string, fallbackPath = "/checkout") {
  if (url) return url;
  const base = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  if (!base) {
    throw integrationErrors.internalError;
  }
  return `${base}${fallbackPath}?order=${encodeURIComponent(orderNumber)}`;
}

function buildReturnUrl(input: {
  orderNumber: string;
  returnUrl?: string;
}) {
  return buildBotResponseUrl(input.returnUrl, input.orderNumber);
}

function buildCancelUrl(input: {
  orderNumber: string;
  cancelUrl?: string;
}) {
  return input.cancelUrl ?? buildBotResponseUrl(undefined, input.orderNumber);
}

function buildLicenseCode() {
  const part = () => generateRandomToken(4).slice(0, 4).toUpperCase();
  return `HANGCU-${part()}-${part()}-${part()}`;
}

function buildPaymentSessionId(orderId: string, orderNumber: string) {
  const suffix = generateRandomToken(10).replace(/[^a-zA-Z0-9]/g, "").slice(0, 10).toUpperCase();
  const prefix = String(orderNumber || orderId || "session").replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  return `ps_${prefix}_${suffix}`;
}

export function resolveCheckoutPlanCode(planCode: string) {
  const normalized = String(planCode || "").trim().toUpperCase();
  const aliases: Record<string, string> = {
    HCV_30D: "FULL_1M",
    HCV_LIFETIME: "FULL_LIFE",
    "HCV-LIC-30": "FULL_1M",
    "HCV-LIC-LIFE": "FULL_LIFE"
  };
  if (aliases[normalized]) {
    return aliases[normalized];
  }
  const groupDurationMatch = normalized.match(/^G\d+:(1M|LIFE)$/);
  if (groupDurationMatch) {
    return groupDurationMatch[1] === "1M" ? "FULL_1M" : "FULL_LIFE";
  }
  return normalized;
}

function getPlanCodeCandidates(planCode: string) {
  const normalized = String(planCode || "").trim().toUpperCase();
  const canonical = resolveCheckoutPlanCode(normalized);
  const candidates = [canonical, normalized];
  if (canonical === "FULL_1M") {
    candidates.push("HCV_30D");
  }
  if (canonical === "FULL_LIFE") {
    candidates.push("HCV_LIFETIME");
  }
  return [...new Set(candidates)];
}

function buildCheckoutProviderCandidates(input: {
  currency: "VND" | "USD";
  preferredProvider?: string | null;
}) {
  const defaults = input.currency === "USD"
    ? ["creem", "paypal", "lemonsqueezy", "manual", "sandbox"]
    : ["payos", "manual", "sandbox"];
  const preferred = String(input.preferredProvider ?? "").trim().toLowerCase();
  return [...new Set([preferred, ...defaults].filter((value): value is string => Boolean(value)))];
}

function findSeedPlanByCode(code: string) {
  for (const candidate of getPlanCodeCandidates(code)) {
    const plan = licensePlansSeed.find((entry) => entry.code === candidate);
    if (plan) {
      return plan;
    }
  }
  return null;
}

function buildBotActivationUrl(licenseCode: string) {
  const normalized = String(licenseCode || "").trim().toUpperCase();
  const baseUrl = process.env.BOT_NEW_URL?.replace(/\/$/, "") || "";
  const username = process.env.BOT_USERNAME?.trim().replace(/^@/, "") || "";
  if (baseUrl) {
    return `${baseUrl}?start=lic_${encodeURIComponent(normalized)}`;
  }
  if (username) {
    return `https://t.me/${username}?start=lic_${encodeURIComponent(normalized)}`;
  }
  return `https://t.me/?start=lic_${encodeURIComponent(normalized)}`;
}

function resolveTelegramUserId(order: {
  metadata?: Record<string, unknown> | null;
  customerEmail?: string | null;
  notes?: string | null;
}) {
  const candidates = [
    order.metadata?.telegramUserId,
    order.metadata?.telegram_user_id,
    order.metadata?.customerRef,
    order.customerEmail?.split("@", 1)[0],
    order.notes?.replace(/^telegram:/i, "")
  ];
  for (const candidate of candidates) {
    const value = String(candidate ?? "").trim().replace(/^tg:/i, "");
    if (/^\d{5,20}$/.test(value)) return value;
  }
  return null;
}

function buildBotCallbackUrl() {
  const rawCallbackUrl =
    process.env.LICENSE_BOT_CALLBACK_URL?.trim() ||
    process.env.BOT_LICENSE_CALLBACK_URL?.trim() ||
    "";
  if (!rawCallbackUrl) {
    console.info(
      `[license-delivery] callback_url_missing LICENSE_BOT_CALLBACK_URL=${process.env.LICENSE_BOT_CALLBACK_URL ? "set" : "missing"} BOT_LICENSE_CALLBACK_URL=${process.env.BOT_LICENSE_CALLBACK_URL ? "set" : "missing"}`
    );
    return "";
  }
  const normalized = rawCallbackUrl.replace(/\/$/, "");
  if (normalized.endsWith("/license-delivery")) {
    return normalized;
  }
  return `${normalized}/license-delivery`;
}

function buildBotPaymentStatusCallbackUrl() {
  const explicit = process.env.LICENSE_BOT_PAYMENT_STATUS_URL?.trim() || process.env.BOT_PAYMENT_STATUS_URL?.trim();
  return (explicit || buildBotCallbackUrl()).replace(/\/$/, "");
}

function signBotCallbackPayload(payload: Record<string, unknown>) {
  const secret =
    process.env.LICENSE_BOT_CALLBACK_SECRET?.trim() ||
    process.env.BOT_LICENSE_CALLBACK_SECRET?.trim() ||
    process.env.WEB_PAYMENT_SECRET?.trim() ||
    process.env.BOT_WEB_HMAC_SECRET?.trim() ||
    "";
  if (!secret) {
    return "";
  }
  const message = [
    String(payload.orderId ?? ""),
    String(payload.telegramUserId ?? ""),
    String(payload.timestamp ?? ""),
    String(payload.nonce ?? "")
  ].join("|");
  return hmacSha256(secret, message);
}

async function notifyBotPaymentStatus(input: {
  orderId: string;
  orderNumber: string;
  botOrderId: string;
  telegramUserId?: string | null;
  currency: string;
  amountMinor: number;
  paymentProvider?: string | null;
  paymentSessionId?: string | null;
}) {
  const baseUrl = buildBotPaymentStatusCallbackUrl();
  if (!baseUrl) return null;
  const timestamp = Math.floor(Date.now() / 1000);
  const nonce = generateRandomToken(16);
  const payload = {
    orderId: input.orderId,
    botOrderId: input.botOrderId,
    orderNumber: input.orderNumber,
    telegramUserId: input.telegramUserId ?? "",
    status: "PAID",
    currency: input.currency,
    amountMinor: input.amountMinor,
    paymentProvider: input.paymentProvider ?? "",
    paymentSessionId: input.paymentSessionId ?? "",
    timestamp,
    nonce
  };
  const signature = signBotCallbackPayload(payload);
  if (!signature) return null;
  await enqueuePaymentCallback({
    botOrderId: input.botOrderId,
    webOrderId: input.orderId,
    orderNumber: input.orderNumber,
    payload: { ...payload, signature }
  });
  const body = JSON.stringify({ ...payload, signature });
  let lastError: unknown = null;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetch(baseUrl, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body
      });
      if (!response.ok) throw new Error(`Bot payment callback failed: ${response.status} ${await response.text().catch(() => "")}`);
      console.info(`[payment-callback] delivered botOrderId=${input.botOrderId} orderNumber=${input.orderNumber} attempt=${attempt}`);
      await markPaymentCallback({ botOrderId: input.botOrderId, status: "delivered" });
      return response.json().catch(() => null);
    } catch (error) {
      lastError = error;
      console.error(`[payment-callback] retry botOrderId=${input.botOrderId} orderNumber=${input.orderNumber} attempt=${attempt} error=${error instanceof Error ? error.message : String(error)}`);
      if (attempt < 3) await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
    }
  }
  await markPaymentCallback({ botOrderId: input.botOrderId, status: "failed", error: lastError instanceof Error ? lastError.message : String(lastError ?? "callback failed") });
  throw lastError instanceof Error ? lastError : new Error(String(lastError ?? "Bot payment callback failed"));
}

function botCallbackSecretFingerprint() {
  const secret =
    process.env.LICENSE_BOT_CALLBACK_SECRET?.trim() ||
    process.env.BOT_LICENSE_CALLBACK_SECRET?.trim() ||
    process.env.WEB_PAYMENT_SECRET?.trim() ||
    process.env.BOT_WEB_HMAC_SECRET?.trim() ||
    "";
  return secret ? hashToken(secret).slice(0, 8) : "missing";
}

async function notifyBotLicenseIssued(input: {
  orderId: string;
  botOrderId?: string | null;
  correlationId?: string | null;
  orderNumber: string;
  telegramUserId?: string | null;
  customerRef?: string | null;
  planCode: string;
  vipPlanCode?: string | null;
  planName: string;
  currency: string;
  amountMinor: number;
  expiresAt?: string | null;
  licenseCode: string;
  activationUrl: string;
  groupIds: string[];
  entitlements: string[];
  locale: "vi" | "en";
  checkoutKind?: string | null;
  paymentSessionId?: string | null;
  paymentProvider?: string | null;
  source?: string | null;
  integrationSource?: string | null;
}) {
  const baseUrl = buildBotCallbackUrl();
  if (!baseUrl) {
    console.info(`[license-delivery] skip bot callback orderNumber=${input.orderNumber} reason=no_callback_url`);
    return null;
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const nonce = generateRandomToken(16);
  const payload = {
    orderId: input.orderId,
    botOrderId: input.botOrderId ?? "",
    correlationId: input.correlationId ?? "",
    orderNumber: input.orderNumber,
    telegramUserId: input.telegramUserId ?? "",
    customerRef: input.customerRef ?? "",
    planCode: input.planCode,
    vipPlanCode: input.vipPlanCode ?? "",
    planName: input.planName,
    currency: input.currency,
    amountMinor: input.amountMinor,
    expiresAt: input.expiresAt ?? "",
    licenseCode: input.licenseCode,
    activationUrl: input.activationUrl,
    groupIds: input.groupIds,
    entitlements: input.entitlements,
    locale: input.locale,
    checkoutKind: input.checkoutKind ?? "license",
    paymentSessionId: input.paymentSessionId ?? "",
    paymentProvider: input.paymentProvider ?? "",
    source: input.source ?? "",
    integrationSource: input.integrationSource ?? "",
    timestamp,
    nonce
  };
  const signature = signBotCallbackPayload(payload);
  if (!signature) {
    console.info(`[license-delivery] skip bot callback orderNumber=${input.orderNumber} reason=no_signature`);
    return null;
  }

  console.info(
    `[license-delivery] sending bot callback orderNumber=${input.orderNumber} orderId=${input.orderId} telegramUserId=${input.telegramUserId || "none"} baseUrl=${baseUrl} secretFingerprint=${botCallbackSecretFingerprint()}`
  );
  const requestBody = JSON.stringify({ ...payload, signature });
  let lastError: unknown = null;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetch(baseUrl, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: requestBody
      });
      if (!response.ok) {
        const body = await response.text().catch(() => "");
        throw new Error(`Bot callback failed: ${response.status} ${body}`);
      }

      console.info(
        `[license-delivery] bot callback delivered orderNumber=${input.orderNumber} orderId=${input.orderId} attempt=${attempt}`
      );
      return response.json().catch(() => null);
    } catch (error) {
      lastError = error;
      console.error(
        `[license-delivery] bot callback retry orderNumber=${input.orderNumber} orderId=${input.orderId} attempt=${attempt} error=${error instanceof Error ? error.message : String(error)}`
      );
      if (attempt < 3) {
        await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
      }
    }
  }
  throw lastError instanceof Error ? lastError : new Error(String(lastError ?? "Bot callback failed"));
}

async function findOrderByOrderNumber(orderNumber: string) {
  const order = await getOrderByOrderNumber(orderNumber);
  if (order) return order;
  const orders = await listAllOrders();
  return orders.find((entry) => entry.orderNumber === orderNumber) ?? null;
}

function verifyLegacyCheckoutSignature(input: {
  orderId: string;
  telegramUserId?: string | null;
  timestamp: number;
  nonce: string;
  signature: string;
}) {
  const secret = getIntegrationSecret();
  if (!secret) {
    throw integrationErrors.internalError;
  }

  const message = [
    String(input.orderId ?? ""),
    String(input.telegramUserId ?? ""),
    String(input.timestamp ?? ""),
    String(input.nonce ?? "")
  ].join("|");
  const expected = hmacSha256(secret, message);
  if (expected !== String(input.signature ?? "").trim()) {
    throw integrationErrors.invalidSignature;
  }
}

export async function createLicenseCheckout(input: unknown) {
  const parsed = licenseCheckoutSchema.parse(input);
  verifyLegacyCheckoutSignature(parsed);

  const integrationSource = String(parsed.source ?? "").trim().toLowerCase();
  const requestedPlanCode = String(parsed.vipPlanCode || parsed.planCode || "").trim().toUpperCase();
  const botPayment =
    (parsed.amountMinor != null && !requestedPlanCode) ||
    integrationSource === "bot_checkout" ||
    integrationSource.startsWith("bot_") ||
    integrationSource === "prive_bot" ||
    integrationSource.startsWith("prive_bot_");
  const canonicalPlanCode = resolveCheckoutPlanCode(requestedPlanCode);
  const planCodeCandidates = getPlanCodeCandidates(requestedPlanCode);
  const dbPlan = botPayment
    ? null
    : (await Promise.all(planCodeCandidates.map((candidate) => getLicensePlanByCode(candidate)))).find(
        (candidate): candidate is NonNullable<Awaited<ReturnType<typeof getLicensePlanByCode>>> => Boolean(candidate)
      );
  const seedPlan = botPayment ? null : findSeedPlanByCode(canonicalPlanCode);
  const plan = botPayment ? {
    id: `bot-payment-${parsed.orderId}`,
    code: "BOT_PAYMENT",
    nameVi: "Thanh toán Telegram",
    nameEn: "Telegram payment",
    slug: "bot-payment",
    description: "Payment delegated to Telegram bot",
    durationDays: 0,
    isLifetime: false,
    entitlementTags: [],
    currencyPrices: { [parsed.currency]: Number(parsed.amountMinor ?? 0) },
    metadata: {}
  } : (dbPlan ?? seedPlan);
  if (!plan) {
    console.info(
      `[license-checkout] plan_missing requestedPlanCode=${requestedPlanCode} canonicalPlanCode=${canonicalPlanCode} currency=${parsed.currency} dbPlan=${dbPlan ? "yes" : "no"} seedPlan=${seedPlan ? "yes" : "no"}`
    );
    throw integrationErrors.planNotFound;
  }

  const price = botPayment ? parsed.amountMinor : plan?.currencyPrices[parsed.currency];
  if (price == null) {
    console.info(
      `[license-checkout] price_missing requestedPlanCode=${requestedPlanCode} canonicalPlanCode=${canonicalPlanCode} currency=${parsed.currency} source=${dbPlan ? "db" : "seed"}`
    );
    const fallbackPrice = seedPlan?.currencyPrices?.[parsed.currency];
    if (fallbackPrice == null) {
      throw integrationErrors.internalError;
    }
    plan.currencyPrices[parsed.currency] = fallbackPrice;
  }
  const resolvedPrice = botPayment ? Number(parsed.amountMinor ?? 0) : plan?.currencyPrices[parsed.currency];
  if (resolvedPrice == null) {
    throw integrationErrors.internalError;
  }
  const licenseCode = botPayment ? "" : String(parsed.activationCode ?? buildLicenseCode()).trim().toUpperCase();
  const paymentSessionId = parsed.paymentSessionId ?? buildPaymentSessionId(parsed.orderId, parsed.orderId);
  console.info(
    `[license-checkout] creating_order requestedPlanCode=${requestedPlanCode} canonicalPlanCode=${canonicalPlanCode} price=${resolvedPrice} currency=${parsed.currency} locale=${parsed.locale} telegramUserId=${parsed.telegramUserId || "n/a"} customerRef=${parsed.customerRef || "n/a"}`
  );

  const order = await createOrder({
    customerEmail: `${parsed.telegramUserId ?? parsed.customerRef ?? parsed.orderId}@telegram.local`,
    currency: parsed.currency,
    source: "telegram_checkout",
    notes: `telegram:${parsed.telegramUserId ?? parsed.customerRef ?? "unknown"}`,
    metadata: {
      telegramUserId: parsed.telegramUserId ?? null,
      customerRef: parsed.customerRef ?? null,
      ...(botPayment
        ? { requestedPlanCode: requestedPlanCode || null, vipPlanCode: requestedPlanCode || null }
        : { planCode: plan.code, vipPlanCode: String(parsed.vipPlanCode || requestedPlanCode), requestedPlanCode }),
      locale: parsed.locale ?? "vi",
      currency: parsed.currency,
      ...(botPayment ? {} : { activationCode: licenseCode, licenseCode }),
      paymentSessionId,
      checkoutKind: "bot",
      paymentProvider: null,
      source: botPayment ? "bot_payment" : "prive_bot",
      integrationSource: botPayment ? "bot_checkout" : (parsed.source ?? "direct_license"),
      orderId: parsed.orderId
      ,botOrderId: parsed.orderId
      ,correlationId: `bot:${parsed.orderId}`
    },
    items: [
      {
        productId: plan.id,
          sku: botPayment ? "BOT_PAYMENT" : plan.code,
          productName: botPayment ? "Telegram payment" : ((parsed.locale ?? "vi") === "vi" ? plan.nameVi : plan.nameEn),
        quantity: 1,
        unitAmountMinor: resolvedPrice,
        totalAmountMinor: resolvedPrice,
          productSnapshot: {
          name: botPayment ? "Telegram payment" : ((parsed.locale ?? "vi") === "vi" ? plan.nameVi : plan.nameEn),
          slug: botPayment ? "bot-payment" : plan.slug,
          shortDescription: botPayment ? "Telegram payment" : plan.description,
          status: "active",
          downloadLimit: 0,
          downloadExpiryDays: botPayment ? 0 : plan.durationDays
        }
      }
    ]
  }).catch((error) => {
    console.error(
      `[license-checkout] create_order_failed requestedPlanCode=${requestedPlanCode} canonicalPlanCode=${canonicalPlanCode} price=${resolvedPrice} currency=${parsed.currency} locale=${parsed.locale} error=${error instanceof Error ? error.message : String(error)}`
    );
    throw error;
  });
  console.info(`[license-checkout] order_created orderNumber=${order.orderNumber} orderId=${order.id} mode=${botPayment ? "BOT_PAYMENT" : "DIRECT_LICENSE"} price=${resolvedPrice}`);
  const returnUrl = buildReturnUrl({ orderNumber: order.orderNumber, returnUrl: parsed.returnUrl });
  const cancelUrl = buildCancelUrl({ orderNumber: order.orderNumber, cancelUrl: parsed.cancelUrl });
  const siteSettings = await getSiteContentSettings().catch(() => null);
  const preferredGateway = siteSettings ? resolvePreferredPaymentGateway(siteSettings, parsed.currency) : null;
  const providerCandidates = botPayment
    ? [preferredGateway?.provider ?? (parsed.currency === "VND" ? "payos" : "paypal")]
    : buildCheckoutProviderCandidates({
        currency: parsed.currency,
        preferredProvider: preferredGateway?.provider ?? null
      });
  let checkout: Awaited<ReturnType<typeof createPaymentCheckout>> | null = null;
  let selectedProvider: string | null = null;
  let lastError: unknown = null;
  for (const provider of providerCandidates) {
    try {
      console.info(
        `[license-checkout] creating_checkout orderNumber=${order.orderNumber} orderId=${order.id} provider=${provider} amount=${order.totalMinor} currency=${order.currency} returnUrl=${returnUrl} cancelUrl=${cancelUrl}`
      );
      checkout = await createPaymentCheckout({
        orderId: order.id,
        orderNumber: order.orderNumber,
        amountMinor: order.totalMinor,
        currency: order.currency,
        customerEmail: order.customerEmail,
        provider: provider as "manual" | "sandbox" | "stripe" | "paypal" | "lemonsqueezy" | "payos" | "creem",
        returnUrl,
        cancelUrl,
        metadata: {
          providerCandidate: provider,
          paymentGatewayProvider: preferredGateway?.provider ?? null,
          paymentGatewayLabel: preferredGateway ? (parsed.locale === "en" ? preferredGateway.labelEn : preferredGateway.labelVi) : null,
          planCode: requestedPlanCode || null,
          requestedPlanCode: requestedPlanCode || null,
          creemProductId: null
        }
      });
      selectedProvider = provider;
      break;
    } catch (error) {
      lastError = error;
      console.error(
        `[license-checkout] create_checkout_failed orderNumber=${order.orderNumber} orderId=${order.id} provider=${provider} amount=${order.totalMinor} currency=${order.currency} error=${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  if (!checkout || !selectedProvider) {
    throw lastError instanceof Error ? lastError : new Error(String(lastError ?? "Checkout creation failed"));
  }

  await updateOrder(order.orderNumber, {
    paymentProvider: selectedProvider,
    providerCheckoutId: checkout.providerCheckoutId ?? null,
    providerOrderId: checkout.providerPaymentId ?? null,
    providerPaymentId: checkout.providerPaymentId ?? null,
    paymentReceiptUrl: checkout.checkoutUrl,
    paymentRecordedAt: new Date().toISOString(),
    lastPaymentEventAt: new Date().toISOString(),
    metadata: {
      ...order.metadata,
      paymentProvider: selectedProvider,
      paymentGatewayProvider: preferredGateway?.provider ?? selectedProvider,
      paymentGatewayLabel: preferredGateway ? (parsed.locale === "en" ? preferredGateway.labelEn : preferredGateway.labelVi) : selectedProvider,
      paymentCheckoutUrl: checkout.checkoutUrl,
      providerCheckoutId: checkout.providerCheckoutId,
      telegramUserId: parsed.telegramUserId ?? null,
      customerRef: parsed.customerRef ?? null,
      ...(botPayment ? {} : { planCode: parsed.planCode }),
      locale: parsed.locale ?? "vi",
      currency: parsed.currency,
      ...(botPayment ? {} : { activationCode: licenseCode, licenseCode }),
      paymentSessionId,
      source: "prive_bot",
      integrationSource: botPayment ? "bot_checkout" : (parsed.source ?? "prive_bot_web_payment")
    }
  });

  return {
    checkoutUrl: checkout.checkoutUrl,
    checkout_url: checkout.checkoutUrl,
    orderId: order.id,
    order_id: order.id,
    orderNumber: order.orderNumber,
    order_number: order.orderNumber,
    ...(botPayment ? {} : { planCode: plan.code, plan_code: plan.code }),
    locale: parsed.locale ?? "vi",
    currency: parsed.currency,
    ...(botPayment ? {} : { activationCode: licenseCode, activation_code: licenseCode, licenseCode, license_code: licenseCode }),
    paymentSessionId,
    payment_session_id: paymentSessionId,
    paymentProvider: selectedProvider,
    payment_provider: selectedProvider,
    telegramUserId: parsed.telegramUserId ?? null,
    telegram_user_id: parsed.telegramUserId ?? null,
    customerRef: parsed.customerRef ?? null,
    customer_ref: parsed.customerRef ?? null,
    entitlements: plan.entitlementTags
  };
}

async function getPlanContextFromLicenseKey(licenseKeyCode: string) {
  const licenseKey = await getLicenseKeyStatus(licenseKeyCode);
  if (!licenseKey) {
    throw integrationErrors.codeNotFound;
  }

  const plan = await getLicensePlanById(licenseKey.licensePlanId);
  if (!plan) {
    throw integrationErrors.internalError;
  }

  return { licenseKey, plan };
}

export async function verifyLicense(input: unknown) {
  const parsed = licenseVerifySchema.parse(input);
  verifyIntegrationRequest({
    timestamp: parsed.timestamp,
    nonce: parsed.nonce,
    signature: parsed.signature,
    rawBody: JSON.stringify(input),
    rateLimitKey: `license:verify:${parsed.telegramUserId}`
  });

  const { licenseKey, plan } = await getPlanContextFromLicenseKey(parsed.licenseKey);

  if (licenseKey.status === "available" || licenseKey.status === "reserved") {
    throw integrationErrors.codeNotIssued;
  }
  if (licenseKey.status === "expired") {
    throw integrationErrors.codeExpired;
  }
  if (licenseKey.status === "revoked") {
    throw integrationErrors.codeRevoked;
  }
  if (licenseKey.externalUserId && licenseKey.externalUserId !== parsed.telegramUserId) {
    throw new Error("License key is bound to another Telegram account");
  }

  const startsAt = licenseKey.issuedAt?.toISOString() ?? new Date().toISOString();
  const endsAt = licenseKey.expiresAt?.toISOString() ?? (plan.isLifetime ? null : new Date(Date.now() + plan.durationDays * 86400000).toISOString());
  const entitlements = getLicenseKeyEntitlements({
    entitlementSnapshot: licenseKey.entitlementSnapshot,
    planEntitlements: plan.entitlementTags
  });
  const vipGroupPolicy = plan.metadata?.vipGroupPolicy as { groupIds?: string[] } | undefined;
  const groupIds = Array.isArray(vipGroupPolicy?.groupIds) ? vipGroupPolicy.groupIds : [];

  return {
    licensePlanCode: plan.code,
    licensePlanSlug: plan.slug,
    status: licenseKey.status,
    startsAt,
    endsAt,
    isLifetime: plan.isLifetime,
    bindingType: licenseKey.bindingType,
    customerRef: licenseKey.customerRef,
    externalUserId: licenseKey.externalUserId,
    entitlements,
    groupIds
  };
}

export async function statusLicense(input: unknown) {
  const parsed = licenseStatusSchema.parse(input);
  verifyIntegrationRequest({
    timestamp: parsed.timestamp,
    nonce: parsed.nonce,
    signature: parsed.signature,
    rawBody: JSON.stringify(input),
    rateLimitKey: `license:status:${parsed.telegramUserId ?? parsed.licenseKey}`
  });

  const { licenseKey, plan } = await getPlanContextFromLicenseKey(parsed.licenseKey);
  return {
    codeLastFour: licenseKey.codeLastFour,
    status: licenseKey.status,
    expiresAt: licenseKey.expiresAt?.toISOString() ?? null,
    revokedReason: licenseKey.revokedReason,
    entitlements: getLicenseKeyEntitlements({
      entitlementSnapshot: licenseKey.entitlementSnapshot,
      planEntitlements: plan.entitlementTags
    })
  };
}

export async function revokeLicense(input: unknown) {
  const parsed = licenseRevokeSchema.parse(input);
  verifyIntegrationRequest({
    timestamp: parsed.timestamp,
    nonce: parsed.nonce,
    signature: parsed.signature,
    rawBody: JSON.stringify(input),
    rateLimitKey: `license:revoke:${parsed.licenseKey}`
  });

  const licenseKey = await revokeLicenseKey({
    code: parsed.licenseKey,
    reason: parsed.reason
  });

  return {
    codeLastFour: licenseKey.codeLastFour,
    status: licenseKey.status
  };
}

export async function issueLicenseFromPaidOrder(orderNumber: string) {
  console.info(`[license-issue] start orderNumber=${orderNumber}`);
  const order = await findOrderByOrderNumber(orderNumber);
  if (!order) {
    console.info(`[license-issue] stop orderNumber=${orderNumber} reason=order_not_found`);
    return null;
  }

  const integrationSource = String(order.metadata?.integrationSource ?? "").trim();
  const botOrderId = String(
    order.metadata?.orderId ??
      order.metadata?.botOrderId ??
      order.metadata?.paymentSessionId ??
      ""
  ).trim();
  const isBotCheckout =
    integrationSource === "prive_bot" ||
    integrationSource.startsWith("prive_bot_") ||
    integrationSource === "bot_checkout" ||
    integrationSource.startsWith("bot_");
  const isNeutralBotPayment =
    String(order.metadata?.planCode ?? "").trim().toUpperCase() === "BOT_PAYMENT" ||
    String(order.items?.[0]?.sku ?? "").trim().toUpperCase() === "BOT_PAYMENT";
  if ((isBotCheckout || isNeutralBotPayment) && botOrderId) {
    console.info(`[license-issue] bot_authoritative orderNumber=${order.orderNumber} botOrderId=${botOrderId} action=callback_status_only`);
    await updateOrder(order.orderNumber, {
      status: "paid",
      paymentStatus: "paid",
      metadata: { ...order.metadata, paidAt: new Date().toISOString(), botCallbackMode: "status_only" }
    });
    try {
      await notifyBotPaymentStatus({
        orderId: order.id,
        orderNumber: order.orderNumber,
        botOrderId,
        telegramUserId: resolveTelegramUserId(order),
        currency: order.currency,
        amountMinor: order.totalMinor,
        paymentProvider: String(order.metadata?.paymentProvider ?? order.metadata?.provider ?? "payos"),
        paymentSessionId: String(order.metadata?.paymentSessionId ?? "")
      });
    } catch (error) {
      console.error(`[payment-callback] failed botOrderId=${botOrderId} orderNumber=${order.orderNumber} error=${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
    return { orderNumber: order.orderNumber, botOrderId, status: "paid", callbackMode: "status_only" };
  }

  const planCodeCandidates = [
    String(order.metadata?.planCode ?? ""),
    String(order.metadata?.requestedPlanCode ?? ""),
    String(order.items[0]?.sku ?? ""),
    String(order.items[0]?.productId ?? "")
  ]
    .map((value) => value.trim().toUpperCase())
    .filter(Boolean);
  let plan = null;
  let resolvedPlanCode = "";
  let planSource = "none";
  for (const candidate of planCodeCandidates) {
    const found = await getLicensePlanByCode(candidate);
    if (found) {
      plan = found;
      resolvedPlanCode = candidate;
      planSource = candidate === String(order.metadata?.planCode ?? "").trim().toUpperCase()
        ? "metadata.planCode"
        : candidate === String(order.metadata?.requestedPlanCode ?? "").trim().toUpperCase()
          ? "metadata.requestedPlanCode"
          : candidate === String(order.items[0]?.sku ?? "").trim().toUpperCase()
            ? "item.sku"
            : "item.productId";
      break;
    }
  }
  if (!plan) {
    const plans = await listLicensePlans();
    const currencyKey = order.currency === "USD" ? "USD" : "VND";
    const amountMatch = plans.find((entry) => entry.currencyPrices?.[currencyKey] === order.totalMinor);
    if (amountMatch) {
      plan = amountMatch;
      resolvedPlanCode = amountMatch.code;
      planSource = `amount_match.${currencyKey}`;
    }
  }
  console.info(
    `[license-issue] plan_resolve orderNumber=${order.orderNumber} orderAmount=${order.totalMinor} currency=${order.currency} source=${planSource} resolvedPlanCode=${resolvedPlanCode || "n/a"} candidates=${planCodeCandidates.join(",") || "none"}`
  );
  console.info(
    `[license-issue] metadata_snapshot orderNumber=${order.orderNumber} planCode=${String(order.metadata?.planCode ?? "n/a")} requestedPlanCode=${String(order.metadata?.requestedPlanCode ?? "n/a")} checkoutKind=${String(order.metadata?.checkoutKind ?? "n/a")} paymentSessionId=${String(order.metadata?.paymentSessionId ?? "n/a")} paymentProvider=${String(order.metadata?.paymentProvider ?? "n/a")} source=${String(order.metadata?.source ?? "n/a")} integrationSource=${String(order.metadata?.integrationSource ?? "n/a")}`
  );
  if (!plan) {
    console.info(
      `[license-issue] stop orderNumber=${order.orderNumber} reason=plan_code_missing orderAmount=${order.totalMinor} currency=${order.currency} candidates=${planCodeCandidates.join(",") || "none"}`
    );
    return null;
  }

  const activationCode = String(order.metadata?.activationCode ?? buildLicenseCode());
  const telegramUserId = resolveTelegramUserId(order);
  console.info(
    `[license-issue] telegram_resolve orderNumber=${order.orderNumber} telegramUserId=${telegramUserId ?? "n/a"} source=${order.metadata?.telegramUserId ? "metadata.telegramUserId" : order.metadata?.customerRef ? "metadata.customerRef" : order.customerEmail ? "customerEmail" : order.notes ? "notes" : "none"}`
  );
  const existing = await listLicenseKeys();
  const alreadyIssued = existing.find((entry) => entry.orderId === order.id && entry.licensePlanId === plan.id);
  if (alreadyIssued) {
    console.info(`[license-issue] skip orderNumber=${order.orderNumber} reason=already_issued licenseKeyId=${alreadyIssued.id}`);
    return alreadyIssued;
  }

  const issued = await createLicenseKey({
    licensePlanId: plan.id,
    orderId: order.id,
    orderItemId: order.items[0]?.productId ?? `${order.id}_item`,
    customerRef: order.metadata?.customerRef ? String(order.metadata.customerRef) : null,
    externalUserId: telegramUserId,
    code: activationCode,
    expiresAt: plan.isLifetime ? null : new Date(Date.now() + plan.durationDays * 86400000),
    bindingType: telegramUserId ? "telegram_user_id" : null,
    entitlementSnapshot: plan.entitlementTags,
    metadata: {
      source: order.metadata?.source ?? "prive_bot",
      telegram_user_id: telegramUserId,
      plan_code: plan.code,
      locale: order.metadata?.locale ?? null,
      currency: order.currency,
      activation_code: order.metadata?.activationCode ?? activationCode
      ,vipPlanCode: order.metadata?.requestedPlanCode ?? order.metadata?.vipPlanCode ?? null
    }
  });

  await updateOrder(order.orderNumber, {
    status: "paid",
    paymentStatus: "paid",
    fulfillmentStatus: "fulfilled",
    deliveredAt: new Date().toISOString(),
    paymentRecordedAt: new Date().toISOString(),
    lastPaymentEventAt: new Date().toISOString(),
    fulfillmentMethod: "auto_email",
    deliveryLicenseKeyIds: [issued.id],
    deliveryProof: {
      licenseKeyId: issued.id,
      licenseKeyLastFour: issued.codeLastFour,
      licensePlanId: plan.id,
      fulfillmentType: "auto_email",
      deliveredAt: new Date().toISOString()
    },
    paymentProvider: String(order.metadata?.paymentProvider ?? order.metadata?.provider ?? "payos"),
    providerCheckoutId: String(order.metadata?.providerCheckoutId ?? order.metadata?.paymentSessionId ?? ""),
    providerOrderId: String(order.metadata?.payosOrderCode ?? order.metadata?.orderId ?? ""),
    providerPaymentId: String(order.metadata?.providerPaymentId ?? ""),
    metadata: {
      ...order.metadata,
      issuedLicenseKeyId: issued.id,
      issuedLicenseKeyCodeLastFour: issued.codeLastFour,
      issuedAt: new Date().toISOString(),
      deliveryProof: {
        licenseKeyId: issued.id,
        licenseKeyLastFour: issued.codeLastFour,
        licensePlanId: plan.id,
        fulfillmentType: "auto_email"
      }
    }
  });

  await writeSystemAuditLog({
    ...getAdminMutationContext(),
    action: "license_key_issued_from_payment",
    entityType: "license_key",
    entityId: issued.id,
    afterData: {
      orderNumber: order.orderNumber,
      licensePlanId: plan.id,
      licenseKeyId: issued.id
    }
  });

  const activationUrl = buildBotActivationUrl(activationCode);
  const vipGroupPolicy = plan.metadata?.vipGroupPolicy as { groupIds?: string[] } | undefined;
  const groupIds = Array.isArray(vipGroupPolicy?.groupIds) ? vipGroupPolicy.groupIds : [];

  if (isBotCheckout || isNeutralBotPayment) {
    try {
      const planName = String(order.metadata?.planName ?? order.items[0]?.productName ?? plan.code);
      await notifyBotLicenseIssued({
        orderId: order.id,
        botOrderId: String(order.metadata?.orderId ?? ""),
        correlationId: String(order.metadata?.correlationId ?? `bot:${order.metadata?.orderId ?? ""}`),
        orderNumber: order.orderNumber,
        telegramUserId,
        customerRef: order.metadata?.customerRef ? String(order.metadata.customerRef) : null,
        planCode: plan.code,
        vipPlanCode: String(order.metadata?.requestedPlanCode ?? order.metadata?.vipPlanCode ?? ""),
        planName,
        currency: order.currency,
        amountMinor: order.totalMinor,
        expiresAt: issued.expiresAt?.toISOString() ?? null,
        licenseCode: activationCode,
        activationUrl,
        groupIds,
        entitlements: plan.entitlementTags,
        locale: String(order.metadata?.locale ?? "vi") === "en" ? "en" : "vi",
        checkoutKind: String(order.metadata?.checkoutKind ?? "license"),
        paymentSessionId: String(order.metadata?.paymentSessionId ?? ""),
        paymentProvider: String(order.metadata?.paymentProvider ?? order.metadata?.provider ?? ""),
        source: String(order.metadata?.source ?? order.source ?? ""),
        integrationSource: String(order.metadata?.integrationSource ?? "")
      });
    } catch (error) {
      console.log(`⚠️ Bot callback failed for order ${order.orderNumber}: ${error instanceof Error ? error.message : String(error)}`);
    }
  } else {
    console.info(`[license-delivery] skip orderNumber=${order.orderNumber} reason=storefront_checkout`);
  }

  // Email is secondary delivery. Never delay the license callback on Resend.
  if (!order.metadata?.emailDeliveredAt && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(order.customerEmail)) {
    const planName = String(order.metadata?.planName ?? order.items[0]?.productName ?? plan.code);
    const expiryText = issued.expiresAt ? issued.expiresAt.toISOString() : "Lifetime / Trọn đời";
    try {
      const emailResult = await sendTransactionalEmail({
        to: order.customerEmail,
        subject: `License của bạn - ${order.orderNumber}`,
        text: `Thanh toán thành công.\n\nGói: ${planName}\nLicense key: ${activationCode}\nHạn sử dụng: ${expiryText}\n\nMã đơn: ${order.orderNumber}`,
        html: `<h2>Thanh toán thành công</h2><p>Gói: <strong>${planName}</strong></p><p>License key: <strong>${activationCode}</strong></p><p>Hạn sử dụng: <strong>${expiryText}</strong></p><p>Mã đơn: ${order.orderNumber}</p><p>Vui lòng giữ email này để kích hoạt license.</p>`
      });
      await updateOrder(order.orderNumber, {
        metadata: {
          ...order.metadata,
          emailDeliveredAt: new Date().toISOString(),
          emailDeliveryProvider: emailResult.provider,
          emailDeliveryMessageId: emailResult.messageId
        }
      });
      console.info(`[license-email] delivered orderNumber=${order.orderNumber} provider=${emailResult.provider}`);
    } catch (error) {
      console.error(`[license-email] failed orderNumber=${order.orderNumber} error=${error instanceof Error ? error.message : String(error)}`);
    }
  } else if (order.metadata?.emailDeliveredAt) {
    console.info(`[license-email] skip orderNumber=${order.orderNumber} reason=already_delivered`);
  }

  return {
    ...issued,
    orderNumber: order.orderNumber,
    planCode: plan.code,
    planName: String(order.metadata?.planName ?? order.items[0]?.productName ?? plan.code),
    telegramUserId,
    customerRef: order.metadata?.customerRef ? String(order.metadata.customerRef) : null,
    activationUrl,
    licenseCode: activationCode,
    groupIds,
    entitlements: plan.entitlementTags,
    locale: String(order.metadata?.locale ?? "vi") === "en" ? "en" : "vi"
  };
}
