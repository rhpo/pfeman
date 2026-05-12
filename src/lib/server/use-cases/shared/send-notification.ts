/**
 * Send Notification use-case
 *
 * Sends both an in-app notification (via repos) and an email (via Resend).
 * Thin wrapper around the $lib/api/email notify function, re-exported as a
 * canonical use-case that all other use-cases consume.
 */
import type { IRepositories } from "$lib/server/repositories/port";
import { notify } from "$lib/api/email";

export interface SendNotificationInput {
    recipientId: string;
    type: string;
    payload?: Record<string, unknown>;
    emailSubject?: string;
    emailBody?: string;
}

export async function sendNotification(
    repos: IRepositories,
    input: SendNotificationInput,
): Promise<void> {
    await notify(repos, input.recipientId, input.type, {
        payload: input.payload ?? {},
        emailSubject: input.emailSubject,
        emailBody: input.emailBody,
    });
}