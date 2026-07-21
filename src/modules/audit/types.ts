export type AuditActor = "admin" | "system" | "integration";

export type CreateAuditLogInput = {
  adminId?: string | null;
  actorType: AuditActor;
  action: string;
  entityType: string;
  entityId: string;
  beforeData?: Record<string, unknown> | null;
  afterData?: Record<string, unknown> | null;
  ipAddress?: string | null;
};
