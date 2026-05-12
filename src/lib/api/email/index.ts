/**
 * Email utilities built on top of Resend.
 *
 * Usage (server-side only):
 *   import { sendMail, sendMails, notify } from "$lib/api/email";
 *   import { confirmationCodeMailBody } from "$lib/api/email/templates";
 *
 *   await sendMail({
 *     to: "user@example.com",
 *     subject: "Your code",
 *     body: confirmationCodeMailBody("123456"),
 *   });
 *
 *   // Send the same email to multiple recipients (BCC — each recipient only sees their own address)
 *   await sendMails(["a@x.com", "b@x.com"], "Subject", "Body HTML");
 *
 *   // Notify a user (DB notification + email)
 *   await notify(event.locals.db, "recipient-profile-id", "subject_status_changed", {
 *     subjectTitle: "...",
 *     newStatus: "valide",
 *   });
 */

import { Resend } from "resend";

const resend = new Resend(RESEND_API);

const DEFAULT_FROM = "ESST PFE <notifications@resend.dev>";

// ============================================================
//  Types
// ============================================================

export interface MailOptions {
    to: string;
    subject: string;
    body: string;
}

// ============================================================
//  sendMail — single recipient
// ============================================================

/**
 * Send a single email.
 *
 * @returns The Resend response object, or throws on error.
 */
export async function sendMail(options: MailOptions) {
    const { to, subject, body } = options;

    const response = await resend.emails.send({
        from: DEFAULT_FROM,
        to,
        subject,
        html: body,
    });

    return response;
}

// ============================================================
//  sendMails — multiple recipients (BCC)
// ============================================================

/**
 * Send the same email to multiple recipients using BCC.
 * Each recipient only sees their own address in the "To" field.
 *
 * @param to      Array of recipient email addresses.
 * @param subject Email subject line.
 * @param body    HTML body content.
 */
export async function sendMails(
    to: string[],
    subject: string,
    body: string,
) {
    if (to.length === 0) return;

    const response = await resend.emails.send({
        from: DEFAULT_FROM,
        to: to[0],
        bcc: to.slice(1),
        subject,
        html: body,
    });

    return response;
}

// ============================================================
//  notify — DB notification + email
// ============================================================

import type { IRepositories } from "$lib/server/repositories/port";
import { RESEND_API } from "$env/static/private";

export interface NotifyOptions {
    /** Arbitrary payload stored in the notification record */
    payload?: Record<string, unknown>;
    /** Email subject (if omitted, no email is sent) */
    emailSubject?: string;
    /** Email body HTML (required if emailSubject is provided) */
    emailBody?: string;
}

/**
 * Notify a user by:
 *  1. Inserting a notification record in the database.
 *  2. Sending an email to the user's email address (if `emailSubject` is provided).
 *
 * @param db          The IRepositories instance (from event.locals.db).
 * @param recipientId The profile ID of the recipient.
 * @param type        Notification type string.
 * @param opts        Additional options (payload, emailSubject, emailBody).
 */
export async function notify(
    db: IRepositories,
    recipientId: string,
    type: string,
    opts: NotifyOptions = {},
) {
    const { payload = {}, emailSubject, emailBody } = opts;

    // 1. Save in-app notification
    await db.notifications.insert(recipientId, type, payload);

    // 2. Send email if subject is provided
    if (emailSubject && emailBody) {
        const profile = await db.users.findProfileById(recipientId);
        const userEmail = profile
            ? await resolveUserEmail(db, recipientId)
            : null;

        if (userEmail) {
            await sendMail({
                to: userEmail,
                subject: emailSubject,
                body: emailBody,
            }).catch((err) => {
                console.error(`[email] Failed to send email to ${userEmail}:`, err);
            });
        }
    }
}

// ============================================================
//  notifyMany — notify multiple users
// ============================================================

/**
 * Notify multiple users by:
 *  1. Inserting a notification record in the database for each.
 *  2. Sending an email to each user (if `emailSubject` is provided).
 *
 * Each user gets their own notification + email — they don't see the other recipients.
 *
 * @param db           The IRepositories instance (from event.locals.db).
 * @param recipientIds Array of profile IDs of the recipients.
 * @param type         Notification type string.
 * @param opts         Additional options (payload, emailSubject, emailBody).
 */
export async function notifyMany(
    db: IRepositories,
    recipientIds: string[],
    type: string,
    opts: NotifyOptions = {},
) {
    const { payload = {}, emailSubject, emailBody } = opts;

    await Promise.all(
        recipientIds.map((recipientId) =>
            notify(db, recipientId, type, { payload, emailSubject, emailBody }),
        ),
    );
}

/**
 * Try to resolve a user's email from their profile ID.
 * Checks students, teachers, and companies tables.
 */
async function resolveUserEmail(
    db: IRepositories,
    profileId: string,
): Promise<string | null> {
    // Check student
    const student = await db.users.findStudentByProfileId(profileId);
    if (student?.email) return student.email;

    // Check teacher
    const teacher = await db.users.findTeacherByProfileId(profileId);
    if (teacher?.email) return teacher.email;

    return null;
}
