import { checkoutRequestSchema } from "@/modules/integration-api/schema";
import { integrationErrors } from "@/modules/integration-api/errors";
import { createCheckoutViaIntegration, verifyIntegrationRequest } from "@/modules/integration-api/service";
import { jsonResponse, readJsonBody, statusForErrorCode, toApiError } from "../licenses/_utils";

export async function POST(request: Request) {
  try {
    const rawBody = await readJsonBody(request);
    const parsed = checkoutRequestSchema.safeParse(JSON.parse(rawBody));
    if (!parsed.success) {
      return jsonResponse({ success: false, error: { code: integrationErrors.invalidRequest.code, message: integrationErrors.invalidRequest.message } }, { status: 400 });
    }

    verifyIntegrationRequest({
      timestamp: parsed.data.timestamp,
      nonce: parsed.data.nonce,
      signature: parsed.data.signature,
      rawBody,
      rateLimitKey: "licenses:checkout"
    });

    const data = await createCheckoutViaIntegration(parsed.data);
    return jsonResponse({ success: true, data });
  } catch (error) {
    const apiError = toApiError(error);
    return jsonResponse(apiError, { status: statusForErrorCode(apiError.error.code) });
  }
}
