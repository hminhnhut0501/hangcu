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
  try {
    const rawBody = await readJsonBody(request);
    const body = JSON.parse(rawBody) as Record<string, unknown>;
    const parsed = checkoutRequestSchema.safeParse(body);
    if (!parsed.success) {
      return jsonResponse({ success: false, error: { code: integrationErrors.invalidRequest.code, message: integrationErrors.invalidRequest.message } }, { status: 400 });
    }
    verifyTimestamp(body);
    verifyLegacySignature(body, parsed.data.signature);

    const data = await createLicenseCheckout(parsed.data);
    return jsonResponse({ success: true, data });
  } catch (error) {
    const apiError = toApiError(error);
    return jsonResponse(apiError, { status: statusForErrorCode(apiError.error.code) });
  }
}
