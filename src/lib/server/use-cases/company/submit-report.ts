/**
 * Submit Report use-case
 *
 * A company employee submits a correction report on their company profile or
 * flags an issue to the admin.
 */
import type { IRepositories } from "$lib/server/repositories/port";
import type { SessionUser } from "$lib/types/domain";
import { error } from "@sveltejs/kit";
import { sendNotification } from "../shared/send-notification";

export interface SubmitReportInput {
    description: string;
}

export async function submitReport(
    repos: IRepositories,
    user: SessionUser,
    input: SubmitReportInput,
): Promise<void> {
    const company = await repos.users.findCompanyByProfileId(user.id);
    if (!company) {
        throw error(403, "Seules les entreprises peuvent soumettre un report.");
    }

    await repos.companyReports.insert({
        company_id: company.profile_id,
        reporter_id: user.id,
        report_type: "company_profile_correction",
        description: input.description,
    });

    // Notify all admins
    const admins = await repos.users.findProfilesByRole("admin");
    for (const admin of admins) {
        await sendNotification(repos, {
            recipientId: admin.id,
            type: "company_report_submitted",
            payload: { companyId: company.profile_id, companyName: company.company_name },
            emailSubject: "Nouvelle demande de correction d'entreprise",
            emailBody: `<p>L'entreprise <strong>${company.company_name}</strong> a soumis une demande de correction.</p><p>${input.description}</p>`,
        });
    }
}