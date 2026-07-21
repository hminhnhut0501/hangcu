export type AdminRole = "super_admin" | "admin" | "support" | "content_manager" | "viewer";

const roleRank: Record<AdminRole, number> = {
  super_admin: 4,
  admin: 3,
  support: 2,
  content_manager: 2,
  viewer: 1
};

export function hasMinimumAdminRole(role: AdminRole, minimum: AdminRole) {
  return roleRank[role] >= roleRank[minimum];
}
