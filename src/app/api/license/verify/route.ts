import { jsonResponse, readJsonBody, statusForErrorCode, toApiError } from "@/app/api/v1/integrations/licenses/_utils";
import { integrationErrors } from "@/modules/integration-api/errors";
import { getIntegrationSecret, verifyIntegrationRequest } from "@/modules/integration-api/service";
import { getLicenseKeyEntitlements, getLicenseKeyStatus } from "@/modules/license-keys/service";
import { getLicensePlanById } from "@/modules/license-plans/service";
import { hmacSha256 } from "@/lib/crypto/hash";

function normalizeLicenseKey(value: unknown) {
  return String(value ?? "").trim().toUpperCase().replace(/[^A-Z0-9_-]/g, "");
}

function buildLegacyPayload(body: Record<string, unknown>) {
  return {
    license_key: normalizeLicenseKey(body.license_key ?? body.licenseKey),
    telegram_user_id: String(body.telegram_user_id ?? body.telegramUserId ?? "").trim(),
    timestamp: Number(body.timestamp ?? 0),
    nonce: String(body.nonce ?? "").trim()
  };
}

function verifyLegacySignature(body: Record<string, unknown>, signature: string) {
  const secret = getIntegrationSecret();
  if (!secret) {
    throw integrationErrors.internalError;
  }

  const payload = buildLegacyPayload(body);
  const message = [
    payload.license_key,
    payload.telegram_user_id,
    String(payload.timestamp),
    payload.nonce
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
    const licenseKey = normalizeLicenseKey(body.license_key ?? body.licenseKey);
    const telegramUserId = String(body.telegram_user_id ?? body.telegramUserId ?? "").trim();
    const signature = String(body.signature ?? "").trim();
    const timestamp = Number(body.timestamp ?? 0);
    const nonce = String(body.nonce ?? "").trim();

    if (!licenseKey || !telegramUserId || !timestamp || !nonce || !signature) {
      return jsonResponse(
        { success: false, error: { code: integrationErrors.invalidRequest.code, message: integrationErrors.invalidRequest.message } },
        { status: 400 }
      );
    }

    const verifyPayload = {
      timestamp,
      nonce,
      signature,
      rawBody,
      rateLimitKey: `license:verify:${telegramUserId}`
    };

    if (String(process.env.BOT_WEB_HMAC_SECRET || process.env.APP_HMAC_SECRET || "").trim()) {
      verifyLegacySignature(body, signature);
    } else {
      verifyIntegrationRequest(verifyPayload);
    }

    const record = await getLicenseKeyStatus(licenseKey);
    if (!record) {
      return jsonResponse({
        success: true,
        data: {
          status: "pending",
          licenseKey,
          license_plan_code: "",
          license_plan_slug: "",
          starts_at: "",
          ends_at: null,
          is_lifetime: false,
          binding_type: null,
          customer_ref: null,
          external_user_id: null,
          entitlements: [],
          group_ids: []
        }
      });
    }

    const plan = await getLicensePlanById(record.licensePlanId);
    if (!plan) {
      throw integrationErrors.internalError;
    }

    const entitlements = getLicenseKeyEntitlements({
      entitlementSnapshot: record.entitlementSnapshot,
      planEntitlements: plan.entitlementTags
    });

    const vipGroupIds = Array.isArray(plan.metadata["vipGroupIds"])
      ? plan.metadata["vipGroupIds"].filter((value) => typeof value === "string")
      : [];

    return jsonResponse({
      success: true,
      data: {
        status: record.status === "issued" ? "active" : record.status,
        licenseKey,
        license_plan_code: plan.code,
        license_plan_slug: plan.slug,
        starts_at: record.issuedAt?.toISOString() ?? new Date().toISOString(),
        ends_at: record.expiresAt?.toISOString() ?? (plan.isLifetime ? null : new Date(Date.now() + plan.durationDays * 86400000).toISOString()),
        is_lifetime: plan.isLifetime,
        binding_type: record.bindingType,
        customer_ref: record.customerRef,
        external_user_id: record.externalUserId,
        entitlements,
        group_ids: vipGroupIds,
        vip_plan_code: String(record.metadata?.vipPlanCode ?? record.metadata?.requestedPlanCode ?? "")
      }
    });
  } catch (error) {
    const apiError = toApiError(error);
    return jsonResponse(apiError, { status: statusForErrorCode(apiError.error.code) });
  }
}
