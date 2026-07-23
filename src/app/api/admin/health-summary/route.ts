import { getDashboardSummary } from "@/modules/dashboard/service";
import { getAnalyticsSummary } from "@/modules/analytics/service";
import { hasSupabasePersistence } from "@/lib/db/persistence";

export async function GET() {
  const [summary, analytics] = await Promise.all([getDashboardSummary(), getAnalyticsSummary()]);

  return Response.json({
    success: true,
    data: {
      supabaseConnected: hasSupabasePersistence(),
      webhookErrorsCount: analytics.webhookErrorsCount,
      failedOrdersCount: analytics.failedOrdersCount,
      pendingOrdersCount: summary.pendingOrdersCount,
      fulfillmentPendingCount: analytics.fulfillmentPendingCount,
      licenseKeyAvailableCount: analytics.licenseKeyAvailableCount,
      licenseKeyIssuedCount: analytics.licenseKeyIssuedCount,
      licenseKeyRedeemedCount: analytics.licenseKeyRedeemedCount
    }
  });
}
