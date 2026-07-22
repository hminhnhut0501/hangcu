import { cookies } from "next/headers";
import { hasMinimumAdminRole, type AdminRole } from "../hardening/permission";
import { decodeAdminSession, type AdminSession } from "./session";

export async function getAdminSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("admin_session")?.value;
  return decodeAdminSession(sessionCookie);
}

export async function requireAdminPermission(minimumRole: AdminRole = "viewer") {
  const session = await getAdminSession();

  if (!session || !hasMinimumAdminRole(session.role, minimumRole)) {
    throw new Error("Forbidden");
  }

  return session;
}
