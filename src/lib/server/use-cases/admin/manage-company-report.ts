/**
 * Manage Company Report use-case
 *
 * Admin resolves or rejects a correction report submitted by a company.
 */
import type { IRepositories, ReportStatus } from "$lib/server/repositories/port";
import type { SessionUser } from "$lib/types/domain";
import { error } from "@sveltejs/kit";
import { sendNotification } from "../shared/send-notification";

export interface ManageCompanyReportInput {
    reportId: string;
    status: Extract<ReportStatus, "resolved" | "rejected">;
    adminResponse?: string | null;
}

export async function manageCompanyReport(
    repos: IRepositories,
    user: SessionUser,
    input: ManageCompanyReportInput,
): Promise<void> {
    const report = await repos.companyReports.findById(input.reportId);
    if (!report) {
        throw error(404, "Report not found");
    }

    if (report.status !== "pending") {
        throw error(400, "Ce report a déjà été traité.");
    }

    await repos.companyReports.update(input.reportId, {
        status: input.status,
        admin_response: input.adminResponse ?? null,
        resolved_by: user.id,
        resolved_at: new Date().toISOString(),
    });

    // Notify the company reporter
    const statusLabel = input.status === "resolved" ? "résolu" : "rejeté";
    await sendNotification(repos, {
        recipientId: report.reporter_id,
        type: "company_report_resolved",
        payload: { reportId: input.reportId, status: input.status },
        emailSubject: `Votre demande de correction a été ${statusLabel}`,
        emailBody: `<p>Votre demande de correction a été <strong>${statusLabel}</strong> par l'administration.</p>${input.adminResponse ? `<p>Réponse : ${input.adminResponse}</p>` : ""
            }`,
    });
}