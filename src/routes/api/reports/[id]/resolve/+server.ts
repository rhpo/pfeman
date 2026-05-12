import { json, error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { manageCompanyReport } from "$lib/server/use-cases/admin/manage-company-report";

export const POST: RequestHandler = async ({ params, locals }) => {
    if (!locals.user) throw error(401, "Non authentifié");
    if (locals.user.role !== "admin") throw error(403, "Réservé à l'admin");

    try {
        await manageCompanyReport(locals.db, locals.user, { reportId: params.id, status: "resolved" });
        return json({ success: true });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Erreur inconnue";
        throw error(500, message);
    }
};