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
        return { pfe: null, deadlinePassed: false };
    }

    // Check deadline from academic year
    const year = currentPfe.academic_year_id
        ? await repos.academicYears.findById(currentPfe.academic_year_id)
        : null;

    let deadlinePassed = false;
    if (year?.memoire_deadline) {
        deadlinePassed = new Date() > new Date(year.memoire_deadline);
    }

    return {
        pfe: currentPfe,
        deadlinePassed,
        memoireDeadline: year?.memoire_deadline ?? null,
    };
};