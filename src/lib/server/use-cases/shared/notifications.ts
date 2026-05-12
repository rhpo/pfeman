import type { IRepositories } from "$lib/server/repositories/port";

export async function createNotification(
  repos: IRepositories,
  recipientId: string,
  type: string,
  payload: Record<string, unknown> = {},
) {
  await repos.notifications.insert(recipientId, type, payload);
}

export async function getUnreadCount(
  repos: IRepositories,
  recipientId: string,
): Promise<number> {
  return repos.notifications.countUnread(recipientId);
}

export async function markAsRead(
  repos: IRepositories,
  notificationId: string,
): Promise<void> {
  await repos.notifications.markRead(notificationId);
}

export async function markAllAsRead(
  repos: IRepositories,
  recipientId: string,
): Promise<void> {
  await repos.notifications.markAllRead(recipientId);
}

export async function listNotifications(
  repos: IRepositories,
  recipientId: string,
  unreadOnly = false,
) {
  return repos.notifications.findByRecipient(recipientId, unreadOnly);
}
