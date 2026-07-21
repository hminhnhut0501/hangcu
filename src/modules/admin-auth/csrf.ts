import { cookies, headers } from "next/headers";
import { verifyCsrfToken } from "../hardening/csrf";

export async function requireValidAdminCsrfToken() {
  const cookieStore = await cookies();
  const headerStore = await headers();
  const cookieToken = cookieStore.get("admin_csrf")?.value ?? "";
  const headerToken = headerStore.get("x-csrf-token") ?? "";

  if (!cookieToken || !headerToken || !verifyCsrfToken(cookieToken, headerToken)) {
    throw new Error("Invalid CSRF token");
  }
}
