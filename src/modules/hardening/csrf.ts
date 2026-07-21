import { randomBytes, timingSafeEqual } from "node:crypto";

export function generateCsrfToken() {
  return randomBytes(32).toString("hex");
}

export function verifyCsrfToken(expected: string, actual: string) {
  const expectedBuf = Buffer.from(expected);
  const actualBuf = Buffer.from(actual);
  if (expectedBuf.length !== actualBuf.length) {
    return false;
  }
  return timingSafeEqual(expectedBuf, actualBuf);
}

function normalizeOrigin(value: string | null | undefined) {
  if (!value) return null;
  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

function getAllowedOrigins() {
  const origins = new Set<string>();
  const appUrl = normalizeOrigin(process.env.NEXT_PUBLIC_APP_URL);
  if (appUrl) origins.add(appUrl);

  const vercelUrl = process.env.VERCEL_URL ? normalizeOrigin(`https://${process.env.VERCEL_URL}`) : null;
  if (vercelUrl) origins.add(vercelUrl);

  return origins;
}

export function isAllowedAdminOrigin(origin: string | null, host: string | null) {
  const allowedOrigins = getAllowedOrigins();
  if (allowedOrigins.size === 0) {
    return true;
  }

  const normalizedOrigin = normalizeOrigin(origin ?? undefined);
  if (normalizedOrigin && allowedOrigins.has(normalizedOrigin)) {
    return true;
  }

  if (host) {
    const normalizedHost = normalizeOrigin(`https://${host}`);
    if (normalizedHost && allowedOrigins.has(normalizedHost)) {
      return true;
    }
  }

  return false;
}
