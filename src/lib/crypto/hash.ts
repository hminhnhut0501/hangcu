import { createHash, createHmac, randomBytes } from "node:crypto";

function normalizeLicenseKey(code: string) {
  return code.replace(/[\s-]+/g, "").toUpperCase();
}

export function normalizeLicenseKeyForLookup(code: string) {
  return normalizeLicenseKey(code);
}

export function hashLicenseKey(code: string) {
  return createHash("sha256").update(normalizeLicenseKey(code)).digest("hex");
}

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function hmacSha256(secret: string, payload: string) {
  return createHmac("sha256", secret).update(payload).digest("hex");
}

export function generateRandomToken(bytes = 32) {
  return randomBytes(bytes).toString("hex");
}
