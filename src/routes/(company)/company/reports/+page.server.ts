import { redirect } from "@sveltejs/kit";
import { createRepositories } from "$lib/server/repositories/factory";
import type { PageServerLoad } from "./$types";

const REPORT_TYPE_LABELS: Record<string, string> = {
    company_profile_correction: "Correction de profil",
    issue_report: "Signalement",
};

const REPORT_STATUS_LABELS: Record<string, string> = {
    pending: "En attente",
    resolved: "Résolu",
    rejected: "Rejeté",
};

function formatDate(dateStr: string | null | undefined): string {
    if (!dateStr) return "—";

    return new Date(dateStr).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

export const load: PageServerLoad = async ({ locals }) => {
    if (!locals.user) redirect(302, "/accounts/company/login");
    if (locals.user.role !== "company") redirect(302, "/");

    const repos = createRepositories();
    const reports = await repos.companyReports.findByCompany(locals.user.id);

    const enriched = reports.map((r) => ({
        ...r,
        report_type_label: REPORT_TYPE_LABELS[r.report_type] ?? r.report_type,
        status_label: REPORT_STATUS_LABELS[r.status] ?? r.status,
        created_at_formatted: formatDate(r.created_at),
        resolved_at_formatted: formatDate(r.resolved_at),
    }));

    return { reports: enriched };
};
