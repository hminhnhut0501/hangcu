import { generateRandomToken, hashToken } from "@/lib/crypto/hash";
import { sendTransactionalEmail } from "@/lib/email/service";
import { listProducts } from "../products/service";
import { getOrderByOrderNumber } from "../orders/service";
import { allocateAvailableLicenseKey, finalizeAllocatedLicenseKey } from "../license-keys/service";
import { listLicenseRulesByProductId } from "../product-license-rules/service";
import { listLicensePlans } from "../license-plans/service";
import { FulfillmentError } from "./errors";

export async function fulfillOrder(orderNumber: string) {
  const order = await getOrderByOrderNumber(orderNumber);
  if (!order) {
    throw new FulfillmentError("Order not found");
  }

  const products = await listProducts();
  const licensePlans = await listLicensePlans();
  const issuedLicenseKeys: string[] = [];

  for (const item of order.items) {
    const product = products.find((entry) => entry.id === item.productId);
    if (!product) continue;

    const rules = await listLicenseRulesByProductId(product.id);
    if (rules.length === 0) continue;

    for (const rule of rules) {
      const plan = licensePlans.find((entry) => entry.id === rule.licensePlanId) ?? null;
      if (!plan) {
        throw new FulfillmentError("License plan not found for product");
      }

      for (let index = 0; index < rule.quantity * item.quantity; index += 1) {
        const allocated = await allocateAvailableLicenseKey(plan.id);
        await finalizeAllocatedLicenseKey({
          licenseKeyId: allocated.id,
          orderId: order.id,
          orderItemId: `${order.orderNumber}:${item.productId}`,
          customerId: null,
          customerRef: order.customerEmail,
          externalUserId: null,
          bindingType: null,
          entitlementSnapshot: plan.entitlementTags,
          expiresAt: plan.isLifetime ? null : new Date(Date.now() + plan.durationDays * 86400000)
        });
        issuedLicenseKeys.push(allocated.codeLastFour);
      }
    }
  }

  const downloadToken = generateRandomToken(24);
  const downloadTokenHash = hashToken(downloadToken);

  await sendTransactionalEmail({
    to: order.customerEmail,
    subject: `Your order ${order.orderNumber} is ready`,
    html: `<p>Your order is ready. Download token: ${downloadTokenHash.slice(0, 12)}</p>`,
    text: `Your order is ready.`
  });

  return {
    orderId: order.id,
    orderNumber: order.orderNumber,
    downloadToken,
    issuedLicenseKeys,
    status: issuedLicenseKeys.length > 0 ? "fulfilled" : "processing"
  } as const;
}
