import { getSupabaseServiceClient } from "@/lib/db/supabase-server";
import { isMissingSupabaseTableError } from "@/lib/db/supabase-errors";
import type { AuditLog } from "./schema";

const auditLogs: AuditLog[] = [];

export interface AuditRepository {
  list(): Promise<AuditLog[]>;
  create(log: AuditLog): Promise<AuditLog>;
}

export class InMemoryAuditRepository implements AuditRepository {
  async list(): Promise<AuditLog[]> {
    return [...auditLogs];
  }

  async create(log: AuditLog): Promise<AuditLog> {
    auditLogs.unshift(log);
    return log;
  }
}

export class SupabaseAuditRepository implements AuditRepository {
  private client = getSupabaseServiceClient();

  async list(): Promise<AuditLog[]> {
    if (!this.client) {
      return new InMemoryAuditRepository().list();
    }

    const { data, error } = await this.client.from("audit_logs").select("*").order("created_at", { ascending: false });
    if (error) {
      if (isMissingSupabaseTableError(error, "audit_logs")) {
        return new InMemoryAuditRepository().list();
      }
      throw error;
    }
    return (data ?? []).map((row) => ({
      id: row.id,
      adminId: row.admin_id ?? null,
      actorType: row.actor_type,
      action: row.action,
      entityType: row.entity_type,
      entityId: row.entity_id,
      beforeData: row.before_data ?? null,
      afterData: row.after_data ?? null,
      ipAddress: row.ip_address ?? null,
      createdAt: new Date(row.created_at)
    }));
  }

  async create(log: AuditLog): Promise<AuditLog> {
    if (!this.client) {
      return new InMemoryAuditRepository().create(log);
    }

    const { data, error } = await this.client
      .from("audit_logs")
      .insert({
        id: log.id,
        admin_id: log.adminId,
        actor_type: log.actorType,
        action: log.action,
        entity_type: log.entityType,
        entity_id: log.entityId,
        before_data: log.beforeData,
        after_data: log.afterData,
        ip_address: log.ipAddress,
        created_at: log.createdAt.toISOString()
      })
      .select("*")
      .single();
    if (error) {
      if (isMissingSupabaseTableError(error, "audit_logs")) {
        return new InMemoryAuditRepository().create(log);
      }
      throw error;
    }
    return {
      id: data.id,
      adminId: data.admin_id ?? null,
      actorType: data.actor_type,
      action: data.action,
      entityType: data.entity_type,
      entityId: data.entity_id,
      beforeData: data.before_data ?? null,
      afterData: data.after_data ?? null,
      ipAddress: data.ip_address ?? null,
      createdAt: new Date(data.created_at)
    };
  }
}
