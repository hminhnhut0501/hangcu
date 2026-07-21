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
