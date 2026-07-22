import { generateRandomToken } from "@/lib/crypto/hash";
import { hmacSha256 } from "@/lib/crypto/hash";
import { writeSystemAuditLog } from "@/modules/audit/service";
import { getAdminMutationContext } from "@/modules/admin-auth/context";
import { createOrder, getOrderByOrderNumber, listAllOrders, updateOrder } from "@/modules/orders/service";
import { createPaymentCheckout } from "@/modules/payments/service";
import { getLicensePlanByCode, getLicensePlanById } from "@/modules/license-plans/service";
import {
  createLicenseKey,
  getLicenseKeyEntitlements,
  getLicenseKeyStatus,
  revokeLicenseKey
} from "@/modules/license-keys/service";
import { integrationErrors } from "@/modules/integration-api/errors";
import { getIntegrationSecret, verifyIntegrationRequest } from "@/modules/integration-api/service";
import { listLicenseKeys, updateLicenseKeyById } from "@/modules/license-keys/service";
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
  return `LIC-${part()}-${part()}-${part()}`;
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

  const plan = await getLicensePlanByCode(parsed.planCode);
  if (!plan) {
    throw integrationErrors.planNotFound;
  }

  const price = plan.currencyPrices[parsed.currency];
  if (price == null) {
    throw integrationErrors.internalError;
  }
  const licenseCode = String(parsed.activationCode ?? buildLicenseCode()).trim().toUpperCase();

  const order = await createOrder({
    customerEmail: `${parsed.telegramUserId ?? parsed.customerRef ?? parsed.orderId}@telegram.local`,
    currency: parsed.currency,
    source: "telegram_checkout",
    notes: `telegram:${parsed.telegramUserId ?? parsed.customerRef ?? "unknown"}`,
    metadata: {
      telegramUserId: parsed.telegramUserId ?? null,
      customerRef: parsed.customerRef ?? null,
      planCode: parsed.planCode,
      locale: parsed.locale,
      currency: parsed.currency,
      activationCode: licenseCode,
      licenseCode,
      source: "prive_bot",
      integrationSource: parsed.source ?? "prive_bot_web_payment",
      orderId: parsed.orderId
    },
    items: [
      {
        productId: plan.id,
        sku: plan.code,
        productName: parsed.locale === "vi" ? plan.nameVi : plan.nameEn,
        quantity: 1,
        unitAmountMinor: price,
        totalAmountMinor: price,
        productSnapshot: {
          name: parsed.locale === "vi" ? plan.nameVi : plan.nameEn,
          slug: plan.slug,
          shortDescription: plan.description,
          status: "active",
          downloadLimit: 0,
          downloadExpiryDays: plan.durationDays
        }
      }
    ]
  });
  const returnUrl = buildReturnUrl({ orderNumber: order.orderNumber, returnUrl: parsed.returnUrl });
  const cancelUrl = buildCancelUrl({ orderNumber: order.orderNumber, cancelUrl: parsed.cancelUrl });
  const provider = parsed.currency === "VND" ? "payos" : "sandbox";
  const checkout = await createPaymentCheckout({
    orderId: order.id,
    orderNumber: order.orderNumber,
    amountMinor: order.totalMinor,
    currency: order.currency,
    customerEmail: order.customerEmail,
    provider,
    returnUrl,
    cancelUrl
  }).catch(async () => {
    const fallbackProvider = "sandbox" as const;
    return createPaymentCheckout({
      orderId: order.id,
      orderNumber: order.orderNumber,
      amountMinor: order.totalMinor,
      currency: order.currency,
      customerEmail: order.customerEmail,
      provider: fallbackProvider,
      returnUrl,
      cancelUrl
    });
  });

  await updateOrder(order.orderNumber, {
    metadata: {
      ...order.metadata,
      paymentProvider: (checkout as { providerCheckoutId?: string } ? provider : provider),
      paymentCheckoutUrl: checkout.checkoutUrl,
      providerCheckoutId: checkout.providerCheckoutId,
      telegramUserId: parsed.telegramUserId ?? null,
      customerRef: parsed.customerRef ?? null,
      planCode: parsed.planCode,
      locale: parsed.locale,
      currency: parsed.currency,
      activationCode: licenseCode,
      licenseCode,
      source: "prive_bot",
      integrationSource: parsed.source ?? "prive_bot_web_payment"
    }
  });

  return {
    checkoutUrl: checkout.checkoutUrl,
    checkout_url: checkout.checkoutUrl,
    orderId: order.id,
    order_id: order.id,
    orderNumber: order.orderNumber,
    order_number: order.orderNumber,
    planCode: plan.code,
    plan_code: plan.code,
    locale: parsed.locale,
    currency: parsed.currency,
    activationCode: licenseCode,
    activation_code: licenseCode,
    licenseCode,
    license_code: licenseCode,
    paymentProvider: provider,
    payment_provider: provider,
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
  const order = await findOrderByOrderNumber(orderNumber);
  if (!order) return null;

  const planCode = String(order.metadata?.planCode ?? "");
  if (!planCode) return null;

  const plan = await getLicensePlanByCode(planCode);
  if (!plan) return null;

  const activationCode = String(order.metadata?.activationCode ?? buildLicenseCode());
  const existing = await listLicenseKeys();
  const alreadyIssued = existing.find((entry) => entry.orderId === order.id && entry.licensePlanId === plan.id);
  if (alreadyIssued) {
    return alreadyIssued;
  }

  const issued = await createLicenseKey({
    licensePlanId: plan.id,
    orderId: order.id,
    orderItemId: order.items[0]?.productId ?? `${order.id}_item`,
    customerRef: order.metadata?.customerRef ? String(order.metadata.customerRef) : null,
    externalUserId: order.metadata?.telegramUserId ? String(order.metadata.telegramUserId) : null,
    code: activationCode,
    expiresAt: plan.isLifetime ? null : new Date(Date.now() + plan.durationDays * 86400000),
    bindingType: order.metadata?.telegramUserId ? "telegram_user_id" : null,
    entitlementSnapshot: plan.entitlementTags,
    metadata: {
      source: order.metadata?.source ?? "prive_bot",
      telegram_user_id: order.metadata?.telegramUserId ?? null,
      plan_code: plan.code,
      locale: order.metadata?.locale ?? null,
      currency: order.currency,
      activation_code: order.metadata?.activationCode ?? activationCode
    }
  });

  await updateOrder(order.orderNumber, {
    status: "paid",
    paymentStatus: "paid",
    fulfillmentStatus: "fulfilled",
    metadata: {
      ...order.metadata,
      issuedLicenseKeyId: issued.id,
      issuedLicenseKeyCodeLastFour: issued.codeLastFour,
      issuedAt: new Date().toISOString()
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

  return issued;
}
