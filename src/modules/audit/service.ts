import { SupabaseAuditRepository } from "./repository";
import type { CreateAuditLogInput } from "./types";

const auditRepository = new SupabaseAuditRepository();

export async function writeAuditLog(input: CreateAuditLogInput) {
  return auditRepository.create({
    id: crypto.randomUUID(),
    adminId: input.adminId ?? null,
    actorType: input.actorType,
    action: input.action,
    entityType: input.entityType,
    entityId: input.entityId,
    beforeData: input.beforeData ?? null,
    afterData: input.afterData ?? null,
    ipAddress: input.ipAddress ?? null,
    createdAt: new Date()
  });
}

export async function listAuditLogs() {
  return auditRepository.list();
}

export async function writeSystemAuditLog(input: Omit<CreateAuditLogInput, "actorType">) {
  return writeAuditLog({
    ...input,
    actorType: "system"
  });
}
