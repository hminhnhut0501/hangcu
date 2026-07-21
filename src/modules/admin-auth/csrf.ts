import { cookies, headers } from "next/headers";
import { isAllowedAdminOrigin, verifyCsrfToken } from "../hardening/csrf";

export async function requireValidAdminCsrfToken() {
  const cookieStore = await cookies();
  const headerStore = await headers();
  const cookieToken = cookieStore.get("admin_csrf")?.value ?? "";
  const headerToken = headerStore.get("x-csrf-token") ?? "";
  const origin = headerStore.get("origin");
  const host = headerStore.get("host");

  if (!isAllowedAdminOrigin(origin, host) || !cookieToken || !headerToken || !verifyCsrfToken(cookieToken, headerToken)) {
    throw new Error("Invalid CSRF token");
  }
}
