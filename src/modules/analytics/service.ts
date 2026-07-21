import { listAuditLogs } from "../audit/service";
import { listLicenseKeys } from "../license-keys/service";
import { listAllOrders } from "../orders/service";
import { listWebhookSummaries } from "../webhooks/service";

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function startOfWeek(date: Date) {
  const day = date.getDay() === 0 ? 7 : date.getDay();
  const monday = new Date(date);
  monday.setDate(date.getDate() - (day - 1));
  return startOfDay(monday);
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function isValidDate(value: unknown): value is string {
  return typeof value === "string" && !Number.isNaN(new Date(value).getTime());
}

function getOrderCreatedAt(order: { metadata: Record<string, unknown> }) {
  return isValidDate(order.metadata.createdAt) ? new Date(order.metadata.createdAt) : null;
}

function groupByDay<T>(items: T[], getDate: (item: T) => Date | null) {
  const map = new Map<string, number>();
  for (const item of items) {
    const date = getDate(item);
    if (!date) continue;
    const key = date.toISOString().slice(0, 10);
    map.set(key, (map.get(key) ?? 0) + 1);
  }
  return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
}

export async function getAnalyticsSummary() {
  const [orders, auditLogs, webhookSummaries, licenseKeys] = await Promise.all([
    listAllOrders(),
    listAuditLogs(),
    listWebhookSummaries(),
    listLicenseKeys()
  ]);

  const now = new Date();
  const dayStart = startOfDay(now);
  const weekStart = startOfWeek(now);
  const monthStart = startOfMonth(now);

  const ordersWithDate = orders.map((order) => ({
    ...order,
    createdAt: getOrderCreatedAt(order)
  }));

  const paidOrders = ordersWithDate.filter((order) => order.paymentStatus === "paid");
  const refundedOrders = ordersWithDate.filter((order) => order.paymentStatus === "refunded" || order.paymentStatus === "partially_refunded");
  const pendingOrders = ordersWithDate.filter((order) => order.paymentStatus === "pending" || order.paymentStatus === "unpaid");
  const failedOrders = ordersWithDate.filter((order) => order.status === "failed");
  const fulfilledOrders = ordersWithDate.filter((order) => order.fulfillmentStatus === "fulfilled");
  const webhookErrors = webhookSummaries.filter((event) => event.processingStatus === "failed");

  const todayOrders = ordersWithDate.filter((order) => order.createdAt && order.createdAt >= dayStart);
  const weekOrders = ordersWithDate.filter((order) => order.createdAt && order.createdAt >= weekStart);
  const monthOrders = ordersWithDate.filter((order) => order.createdAt && order.createdAt >= monthStart);

  const todayRevenueMinor = todayOrders
    .filter((order) => order.paymentStatus === "paid")
    .reduce((sum, order) => sum + order.totalMinor, 0);

  const weekRevenueMinor = weekOrders
    .filter((order) => order.paymentStatus === "paid")
    .reduce((sum, order) => sum + order.totalMinor, 0);

  const monthRevenueMinor = monthOrders
    .filter((order) => order.paymentStatus === "paid")
    .reduce((sum, order) => sum + order.totalMinor, 0);

  const averageOrderValueMinor =
    paidOrders.length > 0 ? Math.round(paidOrders.reduce((sum, order) => sum + order.totalMinor, 0) / paidOrders.length) : 0;

  const conversionRate = orders.length > 0 ? paidOrders.length / orders.length : 0;
  const fulfillmentRate = orders.length > 0 ? fulfilledOrders.length / orders.length : 0;

  const dailyRevenue = groupByDay(
    ordersWithDate.filter((order) => order.createdAt && order.paymentStatus === "paid"),
    (order) => order.createdAt
  ).slice(-14);

  const dailyOrderCount = groupByDay(ordersWithDate.filter((order) => order.createdAt), (order) => order.createdAt).slice(-14);

  return {
    todayRevenueMinor,
    weekRevenueMinor,
    monthRevenueMinor,
    averageOrderValueMinor,
    conversionRate,
    fulfillmentRate,
    todayOrderCount: todayOrders.length,
    weekOrderCount: weekOrders.length,
    monthOrderCount: monthOrders.length,
    paidOrdersCount: paidOrders.length,
    pendingOrdersCount: pendingOrders.length,
    refundedOrdersCount: refundedOrders.length,
    failedOrdersCount: failedOrders.length,
    fulfillmentPendingCount: orders.length - fulfilledOrders.length,
    licenseKeyAvailableCount: licenseKeys.filter((key) => key.status === "available").length,
    licenseKeyIssuedCount: licenseKeys.filter((key) => key.status === "issued").length,
    licenseKeyRedeemedCount: licenseKeys.filter((key) => key.status === "redeemed").length,
    webhookErrorsCount: webhookErrors.length,
    auditEventsCount: auditLogs.length,
    auditByAction: auditLogs.reduce<Record<string, number>>((acc, log) => {
      acc[log.action] = (acc[log.action] ?? 0) + 1;
      return acc;
    }, {}),
    dailyRevenue,
    dailyOrderCount
  };
}
