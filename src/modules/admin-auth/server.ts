import { cookies } from "next/headers";
import { hasMinimumAdminRole, type AdminRole } from "../hardening/permission";

export type AdminSession = {
  adminId: string;
  role: AdminRole;
};

function parseAdminSessionCookie(value: string | undefined): AdminSession | null {
  if (!value) return null;

  try {
    const parsed = JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as AdminSession;
    if (!parsed.adminId || !parsed.role) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("admin_session")?.value;
  return parseAdminSessionCookie(sessionCookie);
}

export async function requireAdminPermission(minimumRole: AdminRole = "viewer") {
  const session = await getAdminSession();

  if (!session || !hasMinimumAdminRole(session.role, minimumRole)) {
    throw new Error("Forbidden");
  }

  return session;
}
