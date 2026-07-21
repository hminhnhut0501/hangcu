export function isMissingSupabaseTableError(error: unknown, tableName: string) {
  if (!error || typeof error !== "object") return false;
  const candidate = error as { code?: unknown; message?: unknown };
  return candidate.code === "PGRST205" || String(candidate.message ?? "").includes(tableName);
}
