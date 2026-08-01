import { getSupabaseServiceClient } from "@/lib/db/supabase-server";
import { isMissingSupabaseTableError } from "@/lib/db/supabase-errors";

export function resolvePaymentCallbackUrl() {
  const explicit = process.env.LICENSE_BOT_PAYMENT_STATUS_URL?.trim() || process.env.BOT_PAYMENT_STATUS_URL?.trim();
  const fallback = process.env.LICENSE_BOT_CALLBACK_URL?.trim() || process.env.BOT_LICENSE_CALLBACK_URL?.trim();
  const raw = explicit || fallback || "";
  if (!raw) return "";
  const normalized = raw.replace(/\/$/, "");
  if (explicit || normalized.endsWith("/license-delivery")) return normalized;
  return `${normalized}/license-delivery`;
}

export async function enqueuePaymentCallback(input: { botOrderId: string; webOrderId: string; orderNumber: string; payload: Record<string, unknown> }) {
  const client = getSupabaseServiceClient();
  if (!client) return null;
  const { data, error } = await client.from("payment_callback_outbox").upsert({
    idempotency_key: `bot:${input.botOrderId}`,
    bot_order_id: input.botOrderId,
    web_order_id: input.webOrderId,
    order_number: input.orderNumber,
    payload: input.payload,
    status: "pending",
    attempts: 0,
    next_attempt_at: new Date().toISOString(),
    last_error: null,
    updated_at: new Date().toISOString()
  }, { onConflict: "idempotency_key" }).select("*").maybeSingle();
  if (error) {
    if (isMissingSupabaseTableError(error, "payment_callback_outbox")) return null;
    throw error;
  }
  return data;
}

export async function markPaymentCallback(input: { botOrderId: string; status: "delivered" | "failed"; error?: string | null }) {
  const client = getSupabaseServiceClient();
  if (!client) return;
  await client.from("payment_callback_outbox").update({
    status: input.status,
    attempts: 1,
    last_error: input.error ?? null,
    delivered_at: input.status === "delivered" ? new Date().toISOString() : null,
    updated_at: new Date().toISOString()
  }).eq("idempotency_key", `bot:${input.botOrderId}`);
}

export async function retryPaymentCallbackOutbox(limit = 10) {
  const client = getSupabaseServiceClient();
  if (!client) return { attempted: 0, delivered: 0, failed: 0 };
  const callbackUrl = resolvePaymentCallbackUrl();
  if (!callbackUrl) return { attempted: 0, delivered: 0, failed: 0 };
  const { data } = await client.from("payment_callback_outbox").select("*").in("status", ["pending", "failed"]).lte("next_attempt_at", new Date().toISOString()).order("updated_at", { ascending: true }).limit(limit);
  let delivered = 0;
  for (const row of data ?? []) {
    const attempts = Number(row.attempts ?? 0) + 1;
    try {
      const response = await fetch(callbackUrl, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(row.payload), signal: AbortSignal.timeout(15_000) });
      if (!response.ok) throw new Error(`${response.status} ${await response.text().catch(() => "")}`);
      await client.from("payment_callback_outbox").update({ status: "delivered", attempts, delivered_at: new Date().toISOString(), last_error: null, updated_at: new Date().toISOString() }).eq("idempotency_key", row.idempotency_key);
      delivered += 1;
    } catch (error) {
      await client.from("payment_callback_outbox").update({ status: "failed", attempts, last_error: error instanceof Error ? error.message : String(error), next_attempt_at: new Date(Date.now() + Math.min(attempts * 60_000, 3_600_000)).toISOString(), updated_at: new Date().toISOString() }).eq("idempotency_key", row.idempotency_key);
    }
  }
  return { attempted: (data ?? []).length, delivered, failed: (data ?? []).length - delivered };
}
