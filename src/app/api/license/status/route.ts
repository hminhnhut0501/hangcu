import { jsonResponse, readJsonBody, statusForErrorCode, toApiError } from "@/app/api/v1/integrations/licenses/_utils";
import { licenseKeyStatusRequestSchema } from "@/modules/integration-api/schema";
import { getLicenseKeyStatusViaIntegration, verifyIntegrationRequest } from "@/modules/integration-api/service";
import { integrationErrors } from "@/modules/integration-api/errors";

export async function POST(request: Request) {
  try {
    const rawBody = await readJsonBody(request);
    const parsed = licenseKeyStatusRequestSchema.safeParse(JSON.parse(rawBody));
    if (!parsed.success) {
      return jsonResponse({ success: false, error: { code: integrationErrors.invalidRequest.code, message: integrationErrors.invalidRequest.message } }, { status: 400 });
    }

    verifyIntegrationRequest({
      timestamp: parsed.data.timestamp,
      nonce: parsed.data.nonce,
      signature: parsed.data.signature,
      rawBody,
      rateLimitKey: "license:status"
    });

    const data = await getLicenseKeyStatusViaIntegration(parsed.data);
    return jsonResponse({ success: true, data });
  } catch (error) {
    const apiError = toApiError(error);
    return jsonResponse(apiError, { status: statusForErrorCode(apiError.error.code) });
  }
}
