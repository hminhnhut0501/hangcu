export type AdminMutationContext = {
  actorType: "admin";
  adminId: string;
  ipAddress: string | null;
};

export function getAdminMutationContext(): AdminMutationContext {
  return {
    actorType: "admin",
    adminId: "admin_local",
    ipAddress: null
  };
}
