import { integrationErrors } from "@/modules/integration-api/errors";
import { LicenseKeyNotFoundError } from "@/modules/license-keys/errors";
import { LicenseKeyUnavailableError } from "@/modules/license-keys/errors";

export async function readJsonBody(request: Request) {
  try {
    return await request.text();
  } catch {
    throw integrationErrors.invalidRequest;
  }
}

export function jsonResponse(body: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...(init?.headers ?? {})
    }
  });
}

export function toApiError(error: unknown) {
  if (error instanceof LicenseKeyNotFoundError) {
    return {
      success: false as const,
      error: {
        code: integrationErrors.codeNotFound.code,
        message: integrationErrors.codeNotFound.message
      }
    };
  }

  if (error instanceof LicenseKeyUnavailableError) {
    return {
      success: false as const,
      error: {
        code: integrationErrors.codeNotIssued.code,
        message: integrationErrors.codeNotIssued.message
      }
    };
  }

  if (error instanceof Error && "code" in error) {
    const typed = error as { code: string; message: string };
    return {
      success: false as const,
      error: {
        code: typed.code,
        message: typed.message
      }
    };
  }

  return {
    success: false as const,
    error: {
      code: "INTERNAL_ERROR",
      message: "Internal error."
    }
  };
}

export function statusForErrorCode(code: string) {
  switch (code) {
    case "INVALID_REQUEST":
      return 400;
    case "INVALID_SIGNATURE":
      return 401;
    case "REQUEST_EXPIRED":
      return 401;
    case "NONCE_ALREADY_USED":
      return 409;
    case "CODE_NOT_FOUND":
    case "PLAN_NOT_FOUND":
      return 404;
    case "CODE_ALREADY_REDEEMED":
    case "CODE_NOT_ISSUED":
    case "CODE_EXPIRED":
    case "CODE_NOT_ACTIVE":
    case "CODE_REVOKED":
      return 409;
    case "RATE_LIMITED":
      return 429;
    default:
      return 500;
  }
}
