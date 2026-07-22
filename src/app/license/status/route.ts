import { jsonResponse, readJsonBody, statusForErrorCode, toApiError } from "@/app/api/v1/integrations/licenses/_utils";
import { integrationErrors } from "@/modules/integration-api/errors";
import { getIntegrationSecret, getLicenseKeyStatusViaIntegration } from "@/modules/integration-api/service";
import { licenseKeyStatusRequestSchema } from "@/modules/integration-api/schema";
import { hmacSha256 } from "@/lib/crypto/hash";

function verifyLegacySignature(body: Record<string, unknown>, signature: string) {
  const secret = getIntegrationSecret();
  if (!secret) throw integrationErrors.internalError;
  const message = [
    String(body.licenseKey ?? body.code ?? ""),
    String(body.externalUserId ?? body.telegramUserId ?? ""),
    String(body.timestamp ?? ""),
    String(body.nonce ?? "")
  ].join("|");
  const expected = hmacSha256(secret, message);
  if (expected !== String(signature ?? "").trim()) {
    throw integrationErrors.invalidSignature;
  }
}

export async function POST(request: Request) {
  try {
    const rawBody = await readJsonBody(request);
    const body = JSON.parse(rawBody) as Record<string, unknown>;
    const parsed = licenseKeyStatusRequestSchema.safeParse(body);
    if (!parsed.success) {
      return jsonResponse({ success: false, error: { code: integrationErrors.invalidRequest.code, message: integrationErrors.invalidRequest.message } }, { status: 400 });
    }

    verifyLegacySignature(body, parsed.data.signature);
    const data = await getLicenseKeyStatusViaIntegration(parsed.data);
    return jsonResponse({ success: true, data });
  } catch (error) {
    const apiError = toApiError(error);
    return jsonResponse(apiError, { status: statusForErrorCode(apiError.error.code) });
  }
}
