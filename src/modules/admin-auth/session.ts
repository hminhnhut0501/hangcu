import type { AdminRole } from "../hardening/permission";

export type AdminSession = {
  adminId: string;
  role: AdminRole;
};

export function encodeAdminSession(adminId: string, role: AdminRole) {
  return Buffer.from(JSON.stringify({ adminId, role }), "utf8").toString("base64url");
}

export function decodeAdminSession(value: string | undefined): AdminSession | null {
  if (!value) return null;

  try {
    const parsed = JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as AdminSession;
    if (!parsed.adminId || !parsed.role) return null;
    return parsed;
  } catch {
    return null;
  }
}
