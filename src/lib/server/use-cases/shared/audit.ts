import type { IRepositories, AuditActionType } from "$lib/server/repositories/port";

export async function logAction(
  repos: IRepositories,
  actorId: string,
  action: AuditActionType,
  entity: string,
  entityId: string,
  metadata: Record<string, unknown> = {},
) {
  await repos.audit.log(actorId, action, entity, entityId, metadata);
}

export async function listAuditLogs(
  repos: IRepositories,
  filters?: { action?: AuditActionType; actorId?: string },
) {
  return repos.audit.findAll(filters);
}
