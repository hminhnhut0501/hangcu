import { requireAdminPermission } from "./server";
import { requireValidAdminCsrfToken } from "./csrf";

export function requireAdminMutationAccess(minimumRole: "viewer" | "support" | "content_manager" | "admin" | "super_admin" = "admin") {
  return Promise.all([requireAdminPermission(minimumRole), requireValidAdminCsrfToken()]).then(([session]) => session);
}
