import type { AdminRole } from "../hardening/permission";
import { createHmac, timingSafeEqual } from "node:crypto";

export type AdminSession = {
  adminId: string;
  role: AdminRole;
  iat: number;
  exp: number;
};

const SESSION_TTL_SECONDS = Math.max(900, Number(process.env.ADMIN_SESSION_TTL_SECONDS ?? 28800));
const roles = new Set<AdminRole>(["super_admin", "admin", "support", "content_manager", "viewer"]);

function getSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET?.trim();
  if (!secret) throw new Error("ADMIN_SESSION_SECRET is not configured");
  return secret;
}

function sign(value: string) {
  return createHmac("sha256", getSecret()).update(value).digest("base64url");
}

export function encodeAdminSession(adminId: string, role: AdminRole) {
  const now = Math.floor(Date.now() / 1000);
  const payload = Buffer.from(JSON.stringify({ adminId, role, iat: now, exp: now + SESSION_TTL_SECONDS }), "utf8").toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function decodeAdminSession(value: string | undefined): AdminSession | null {
  if (!value) return null;

  try {
    const [payload, signature] = value.split(".");
    if (!payload || !signature) return null;
    const expected = Buffer.from(sign(payload));
    const actual = Buffer.from(signature);
    if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null;
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as AdminSession;
    if (!parsed.adminId || !roles.has(parsed.role) || !Number.isFinite(parsed.exp) || parsed.exp <= Math.floor(Date.now() / 1000)) return null;
    return parsed;
  } catch {
    return null;
  }
}
