import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "$lib/types/database.js";
import type { IAuditLogRepository, AuditActionType } from "../../port.js";

export class SupabaseAuditRepo implements IAuditLogRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async log(
    actorId: string,
    action: AuditActionType,
    entity: string,
    entityId: string,
    metadata: Record<string, unknown> = {},
  ): Promise<void> {
    const { error } = await this.client.from("audit_logs").insert({
      actor_id: actorId,
      action,
      entity,
      entity_id: entityId,
      metadata: metadata as Json,
    });
    if (error) throw error;
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
    let query = this.client
      .from("audit_logs")
      .select("*")
      .order("created_at", { ascending: false });

    if (filters?.action) {
      query = query.eq("action", filters.action);
    }
    if (filters?.actorId) {
      query = query.eq("actor_id", filters.actorId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as unknown as {
      id: string;
      actor_id: string;
      action: string;
      entity: string;
      entity_id: string;
      metadata: Record<string, unknown>;
      created_at: string;
    }[];
  }
}
