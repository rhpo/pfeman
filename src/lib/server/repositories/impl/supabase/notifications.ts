import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "$lib/types/database.js";
import type { INotificationRepository, NotificationRow } from "../../port.js";

export class SupabaseNotificationRepo implements INotificationRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async findByRecipient(
    recipientId: string,
    unreadOnly = false,
  ): Promise<NotificationRow[]> {
    let query = this.client
      .from("notifications")
      .select("*")
      .eq("recipient_id", recipientId)
      .order("created_at", { ascending: false });

    if (unreadOnly) {
      query = query.is("read_at", null);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as unknown as NotificationRow[];
  }

  async markRead(id: string): Promise<void> {
    const { error } = await this.client
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("id", id);
    if (error) throw error;
  }

  async markAllRead(recipientId: string): Promise<void> {
    const { error } = await this.client
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("recipient_id", recipientId)
      .is("read_at", null);
    if (error) throw error;
  }

  async insert(
    recipientId: string,
    type: string,
    payload: Record<string, unknown>,
  ): Promise<void> {
    const { error } = await this.client
      .from("notifications")
      .insert({ recipient_id: recipientId, type, payload: payload as Json });
    if (error) throw error;
  }

  async countUnread(recipientId: string): Promise<number> {
    const { count, error } = await this.client
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("recipient_id", recipientId)
      .is("read_at", null);
    if (error) throw error;
    return count ?? 0;
  }
}
