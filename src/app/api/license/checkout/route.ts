import { jsonResponse, readJsonBody, statusForErrorCode, toApiError } from "@/app/api/v1/integrations/licenses/_utils";
import { checkoutRequestSchema } from "@/modules/integration-api/schema";
import { createLicenseCheckout } from "@/modules/license-bridge/service";
import { getIntegrationSecret } from "@/modules/integration-api/service";
import { integrationErrors } from "@/modules/integration-api/errors";
import { hmacSha256 } from "@/lib/crypto/hash";

function verifyLegacySignature(body: Record<string, unknown>, signature: string) {
  const secret = getIntegrationSecret();
  if (!secret) {
    throw integrationErrors.internalError;
  }

  const message = [
    String(body.orderId ?? body.order_id ?? ""),
    String(body.telegramUserId ?? body.telegram_user_id ?? ""),
    String(body.timestamp ?? ""),
    String(body.nonce ?? "")
  ].join("|");
  const expected = hmacSha256(secret, message);
  if (expected !== String(signature ?? "").trim()) {
    throw integrationErrors.invalidSignature;
  }
}

function verifyTimestamp(body: Record<string, unknown>) {
  const timestamp = Number(body.timestamp);
  if (!Number.isFinite(timestamp)) {
    throw integrationErrors.invalidRequest;
  }
  const ageMs = Math.abs(Date.now() - timestamp * 1000);
  if (ageMs > 5 * 60 * 1000) {
    throw integrationErrors.requestExpired;
  }
}

export async function POST(request: Request) {
  let trace: {
    orderId?: string;
    telegramUserId?: string;
    planCode?: string;
    currency?: string;
    locale?: string;
    timestamp?: number;
  } = {};
  try {
    const rawBody = await readJsonBody(request);
    const body = JSON.parse(rawBody) as Record<string, unknown>;
    const parsed = checkoutRequestSchema.safeParse(body);
    if (!parsed.success) {
      console.info(
        `[license-checkout] invalid_request stage=schema orderId=${String(body.orderId ?? body.order_id ?? "n/a")} planCode=${String(body.planCode ?? "n/a")} currency=${String(body.currency ?? "n/a")} keys=${Object.keys(body).sort().join(",")} issues=${JSON.stringify(parsed.error.issues)} secret=${getIntegrationSecret() ? "set" : "missing"}`
      );
      return jsonResponse({ success: false, error: { code: integrationErrors.invalidRequest.code, message: integrationErrors.invalidRequest.message } }, { status: 400 });
    }
    trace = {
      orderId: String(parsed.data.orderId ?? ""),
      telegramUserId: String(parsed.data.telegramUserId ?? ""),
      planCode: String(parsed.data.planCode ?? ""),
      currency: String(parsed.data.currency ?? ""),
      locale: String(parsed.data.locale ?? ""),
      timestamp: parsed.data.timestamp
    };
    verifyTimestamp(body);
    verifyLegacySignature(body, parsed.data.signature);
    console.info(
      `[license-checkout] verified orderId=${trace.orderId || "n/a"} telegramUserId=${trace.telegramUserId || "n/a"} planCode=${trace.planCode || "n/a"} currency=${trace.currency || "n/a"} secret=${getIntegrationSecret() ? "set" : "missing"}`
    );

    const data = await createLicenseCheckout(parsed.data);
    return jsonResponse({ success: true, data });
  } catch (error) {
    const apiError = toApiError(error);
    console.error(
      `[license-checkout] failed orderId=${trace.orderId || "n/a"} telegramUserId=${trace.telegramUserId || "n/a"} planCode=${trace.planCode || "n/a"} currency=${trace.currency || "n/a"} locale=${trace.locale || "n/a"} secret=${getIntegrationSecret() ? "set" : "missing"} code=${apiError.error.code} message=${apiError.error.message}`
    );
    return jsonResponse(apiError, { status: statusForErrorCode(apiError.error.code) });
  }
}
