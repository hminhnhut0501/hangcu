import { z } from "zod";

export const auditLogSchema = z.object({
  id: z.string(),
  adminId: z.string().nullable(),
  actorType: z.string().min(1),
  action: z.string().min(1),
  entityType: z.string().min(1),
  entityId: z.string().min(1),
  beforeData: z.record(z.string(), z.unknown()).nullable(),
  afterData: z.record(z.string(), z.unknown()).nullable(),
  ipAddress: z.string().nullable(),
  createdAt: z.date()
});

export type AuditLog = z.infer<typeof auditLogSchema>;
