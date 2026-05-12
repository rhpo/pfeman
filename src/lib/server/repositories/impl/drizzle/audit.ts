import { eq, and } from 'drizzle-orm';
import { db } from '$lib/server/db/client.js';
import { auditLogs } from '$lib/server/db/schema.js';
import type { IAuditLogRepository, AuditActionType } from '../../port.js';

export class DrizzleAuditRepo implements IAuditLogRepository {
  async log(
    actorId: string,
    action: AuditActionType,
    entity: string,
    entityId: string,
    metadata?: Record<string, unknown>,
  ): Promise<void> {
    await db.insert(auditLogs).values({
      actor_id: actorId,
      action,
      entity,
      entity_id: entityId,
      metadata: metadata ?? {},
    });
  }

  async findAll(filters?: { action?: AuditActionType; actorId?: string }): Promise<{
    id: string;
    actor_id: string;
    action: string;
    entity: string;
    entity_id: string;
    metadata: Record<string, unknown>;
    created_at: string;
  }[]> {
    const conditions = [];
    if (filters?.action) conditions.push(eq(auditLogs.action, filters.action));
    if (filters?.actorId) conditions.push(eq(auditLogs.actor_id, filters.actorId));

    const query = db.select().from(auditLogs).orderBy(auditLogs.created_at);
    if (conditions.length > 0) {
      query.where(and(...conditions));
    }
    return await query;
  }
}
