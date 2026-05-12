import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { sendMail, sendMails, notify, notifyMany } from "$lib/api/email";
import { createRepositories } from "$lib/server/repositories/factory";

export const POST: RequestHandler = async ({ request, locals }) => {
    if (!locals.user || locals.user.role !== "admin") {
        return json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { action } = body;

    try {
        switch (action) {
            case "send_to_single": {
                const { to, subject, html } = body;
                if (!to || !subject || !html) {
                    return json({ error: "Missing required fields: to, subject, html" }, { status: 400 });
                }
                await sendMail({ to, subject, body: html });
                return json({ success: true });
            }

            case "send_to_multiple": {
                const { to, recipientGroup, subject, html } = body;
                if (!subject || !html) {
                    return json({ error: "Missing required fields: subject, html" }, { status: 400 });
                }

                let emails: string[] = to || [];

                // Resolve group emails server-side
                if (recipientGroup) {
                    const db = createRepositories();
                    const [teachers, students] = await Promise.all([
                        db.users.findAllTeachers(),
                        db.users.findAllStudents(),
                    ]);

                    if (recipientGroup === "all_students" || recipientGroup === "all") {
                        emails = [
                            ...emails,
                            ...students.map((s) => s.email).filter(Boolean) as string[],
                        ];
                    }
                    if (recipientGroup === "all_teachers" || recipientGroup === "all") {
                        emails = [
                            ...emails,
                            ...teachers.map((t) => t.email).filter(Boolean) as string[],
                        ];
                    }
                }

                if (emails.length === 0) {
                    return json({ error: "No recipients found" }, { status: 400 });
                }

                await sendMails(emails, subject, html);
                return json({ success: true, count: emails.length });
            }

            case "notify_single": {
                const { recipientId, type, payload, emailSubject, emailBody } = body;
                if (!recipientId || !type) {
                    return json({ error: "Missing required fields: recipientId, type" }, { status: 400 });
                }
                const db = createRepositories();
                await notify(db, recipientId, type, { payload, emailSubject, emailBody });
                return json({ success: true });
            }

            case "notify_multiple": {
                const { recipientIds, type, payload, emailSubject, emailBody } = body;
                if (!recipientIds || !Array.isArray(recipientIds) || recipientIds.length === 0 || !type) {
                    return json({ error: "Missing required fields: recipientIds (array), type" }, { status: 400 });
                }
                const db = createRepositories();
                await notifyMany(db, recipientIds, type, { payload, emailSubject, emailBody });
                return json({ success: true });
            }

            default:
                return json({ error: `Unknown action: ${action}` }, { status: 400 });
        }
    } catch (err) {
        console.error("[send-email] Error:", err);
        return json({ error: String(err) }, { status: 500 });
    }
};
