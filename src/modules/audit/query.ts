import type { AuditLog } from "./schema";

export type AuditLogQuery = {
  q?: string;
  action?: string;
  entityType?: string;
  actorType?: string;
  from?: string;
  to?: string;
};

function isValidDate(value: string | undefined) {
  if (!value) return false;
  return !Number.isNaN(new Date(value).getTime());
}

export function normalizeAuditQuery(input: Record<string, string | string[] | undefined>): AuditLogQuery {
  const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);
  return {
    q: first(input.q)?.trim() || undefined,
    action: first(input.action)?.trim() || undefined,
    entityType: first(input.entityType)?.trim() || undefined,
    actorType: first(input.actorType)?.trim() || undefined,
    from: isValidDate(first(input.from)) ? first(input.from) : undefined,
    to: isValidDate(first(input.to)) ? first(input.to) : undefined
  };
}

export function filterAuditLogs(logs: AuditLog[], query: AuditLogQuery) {
  const from = query.from ? new Date(query.from) : null;
  const to = query.to ? new Date(query.to) : null;

  return logs.filter((log) => {
    const term = query.q?.toLowerCase();
    const matchesQuery =
      !term ||
      log.action.toLowerCase().includes(term) ||
      log.entityType.toLowerCase().includes(term) ||
      log.entityId.toLowerCase().includes(term) ||
      log.adminId?.toLowerCase().includes(term) ||
      log.actorType.toLowerCase().includes(term);
    const matchesAction = !query.action || log.action === query.action;
    const matchesEntityType = !query.entityType || log.entityType === query.entityType;
    const matchesActorType = !query.actorType || log.actorType === query.actorType;
    const matchesFrom = !from || log.createdAt >= from;
    const matchesTo = !to || log.createdAt <= to;
    return matchesQuery && matchesAction && matchesEntityType && matchesActorType && matchesFrom && matchesTo;
  });
}

export function serializeAuditLogValue(value: unknown) {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return JSON.stringify(value);
}
