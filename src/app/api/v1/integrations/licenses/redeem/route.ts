import { licenseKeyStatusRequestSchema, redeemLicenseKeyRequestSchema } from "@/modules/integration-api/schema";
import { integrationErrors } from "@/modules/integration-api/errors";
import { redeemLicenseKeyViaIntegration, verifyIntegrationRequest } from "@/modules/integration-api/service";
import { jsonResponse, readJsonBody, statusForErrorCode, toApiError } from "../_utils";

export async function POST(request: Request) {
  try {
    const rawBody = await readJsonBody(request);
    const parsed = redeemLicenseKeyRequestSchema.safeParse(JSON.parse(rawBody));
    if (!parsed.success) {
      return jsonResponse({ success: false, error: { code: integrationErrors.invalidRequest.code, message: integrationErrors.invalidRequest.message } }, { status: 400 });
    }

    verifyIntegrationRequest({
      timestamp: parsed.data.timestamp,
      nonce: parsed.data.nonce,
      signature: parsed.data.signature,
      rawBody,
      rateLimitKey: "licenses:redeem"
    });

    const data = await redeemLicenseKeyViaIntegration(parsed.data);
    return jsonResponse({ success: true, data });
  } catch (error) {
    const apiError = toApiError(error);
    return jsonResponse(apiError, { status: statusForErrorCode(apiError.error.code) });
  }
}
