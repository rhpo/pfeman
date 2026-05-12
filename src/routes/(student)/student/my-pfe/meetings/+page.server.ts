import { redirect } from "@sveltejs/kit";
import { createRepositories } from "$lib/server/repositories/factory";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
    if (!locals.user) redirect(302, "/accounts/login");

    const repos = createRepositories();
    const pfes = await repos.assignments.findByStudent(locals.user.id);
    const currentPfe = pfes.find(
        (p) => p.status === "en_cours" || p.status === "soutenance_planifiee",
    );

    if (!currentPfe) {
        return { pfe: null, progressReports: [] };
    }

    const progressReports = await repos.progress.findByAssignment(currentPfe.id);

    return {
        pfe: currentPfe,
        progressReports,
    };
};