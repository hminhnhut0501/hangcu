import { listAuditLogs } from "@/modules/audit/service";
import { filterAuditLogs, normalizeAuditQuery, serializeAuditLogValue } from "@/modules/audit/query";

function csvEscape(value: string) {
  return `"${value.replace(/"/g, '""')}"`;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const params = normalizeAuditQuery({
    q: searchParams.get("q") ?? undefined,
    action: searchParams.get("action") ?? undefined,
    entityType: searchParams.get("entityType") ?? undefined,
    actorType: searchParams.get("actorType") ?? undefined,
    from: searchParams.get("from") ?? undefined,
    to: searchParams.get("to") ?? undefined
  });

  const logs = filterAuditLogs(await listAuditLogs(), params);
  const rows = [
    [
      "id",
      "createdAt",
      "actorType",
      "adminId",
      "action",
      "entityType",
      "entityId",
      "ipAddress",
      "beforeData",
      "afterData"
    ],
    ...logs.map((log) => [
      log.id,
      log.createdAt.toISOString(),
      log.actorType,
      log.adminId ?? "",
      log.action,
      log.entityType,
      log.entityId,
      log.ipAddress ?? "",
      serializeAuditLogValue(log.beforeData),
      serializeAuditLogValue(log.afterData)
    ])
  ];

  const csv = rows.map((row) => row.map((cell) => csvEscape(String(cell))).join(",")).join("\n");

  return new Response(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": 'attachment; filename="audit-log.csv"'
    }
  });
}
