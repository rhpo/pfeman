import { eq, and, isNull, desc, count } from 'drizzle-orm';
import { db } from '$lib/server/db/client.js';
import { notifications } from '$lib/server/db/schema.js';
import type {
  INotificationRepository,
  NotificationRow,
} from '../../port.js';

export class DrizzleNotificationRepo implements INotificationRepository {
  async findByRecipient(
    recipientId: string,
    unreadOnly = false,
  ): Promise<NotificationRow[]> {
    return await db.query.notifications.findMany({
      where: (n, { eq, isNull, and }) =>
        unreadOnly
          ? and(eq(n.recipient_id, recipientId), isNull(n.read_at))
          : eq(n.recipient_id, recipientId),
      orderBy: (n, { desc }) => [desc(n.created_at)],
    });
  }

  async markRead(id: string): Promise<void> {
    await db
      .update(notifications)
      .set({ read_at: new Date().toISOString() })
      .where(eq(notifications.id, id));
  }

  async markAllRead(recipientId: string): Promise<void> {
    await db
      .update(notifications)
      .set({ read_at: new Date().toISOString() })
      .where(
        and(
          eq(notifications.recipient_id, recipientId),
          isNull(notifications.read_at),
        ),
      );
  }

  async insert(
    recipientId: string,
    type: string,
    payload: Record<string, unknown>,
  ): Promise<void> {
    await db.insert(notifications).values({
      recipient_id: recipientId,
      type,
      payload,
    });
  }

  async countUnread(recipientId: string): Promise<number> {
    const [result] = await db
      .select({ value: count() })
      .from(notifications)
      .where(
        and(
          eq(notifications.recipient_id, recipientId),
          isNull(notifications.read_at),
        ),
      );
    return result?.value ?? 0;
  }
}
