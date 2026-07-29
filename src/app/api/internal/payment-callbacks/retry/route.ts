import { retryPaymentCallbackOutbox } from "@/modules/payment-callback-outbox/service";

export async function POST(request: Request) {
  const expected = process.env.PAYMENT_CALLBACK_RETRY_SECRET?.trim();
  const provided = request.headers.get("x-payment-callback-retry-secret")?.trim();
  if (!expected || expected !== provided) return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
  const result = await retryPaymentCallbackOutbox();
  return Response.json({ success: true, data: result });
}
