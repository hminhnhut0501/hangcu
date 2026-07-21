import { listCoupons } from "../coupons/service";
import { listAuditLogs } from "../audit/service";
import { listWebhookSummaries } from "../webhooks/service";
import { listAllOrders } from "../orders/service";
import { listLicenseKeys } from "../license-keys/service";

export async function getDashboardSummary() {
  const [orders, coupons, auditLogs, webhookSummaries, licenseKeys] = await Promise.all([
    listAllOrders(),
    listCoupons(),
    listAuditLogs(),
    listWebhookSummaries(),
    listLicenseKeys()
  ]);

  const paidOrders = orders.filter((order) => order.paymentStatus === "paid");
  const pendingOrders = orders.filter((order) => order.paymentStatus === "pending" || order.paymentStatus === "unpaid");
  const webhookErrors = webhookSummaries.filter((event) => event.processingStatus === "failed");

  return {
    todayRevenueMinor: paidOrders.reduce((sum, order) => sum + order.totalMinor, 0),
    monthRevenueMinor: paidOrders.reduce((sum, order) => sum + order.totalMinor, 0),
    paidOrdersCount: paidOrders.length,
    pendingOrdersCount: pendingOrders.length,
    refundCount: 0,
    licenseKeyRemaining: licenseKeys.length,
    licenseKeyIssued: auditLogs.filter((log) => log.action === "license_key_created").length,
    licenseKeyRedeemed: auditLogs.filter((log) => log.action === "license_key_redeemed").length,
    fulfillmentPending: 0,
    webhookErrorsCount: webhookErrors.length,
    couponCount: coupons.length
  };
}
