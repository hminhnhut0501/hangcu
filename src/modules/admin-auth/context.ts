export type AdminMutationContext = {
  actorType: "admin";
  adminId: string | null;
  ipAddress: string | null;
};

export function getAdminMutationContext(): AdminMutationContext {
  return {
    actorType: "admin",
    adminId: null,
    ipAddress: null
  };
}
