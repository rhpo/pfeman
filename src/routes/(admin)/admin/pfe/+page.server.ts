import { redirect } from "@sveltejs/kit";
import { createRepositories } from "$lib/server/repositories/factory";
import type { PageServerLoad } from "./$types";

const PFE_STATUS_LABELS: Record<string, string> = {
    en_cours: "En cours",
    soutenance_planifiee: "Soutenance planifiée",
    valide: "Validé",
    refuse: "Refusé",
};

export const load: PageServerLoad = async ({ locals }) => {
    if (!locals.user) redirect(302, "/accounts/login");
    if (locals.user.role !== "admin") redirect(302, "/");

    const repos = createRepositories();
    const assignments = await repos.assignments.findAll();

    const enriched = await Promise.all(
        assignments.map(async (a) => {
            const subject = await repos.subjects.findById(a.subject_id);
            const supervisor = await repos.users.findProfileById(a.supervisor_id);
            const coSupervisor = a.co_supervisor_id
                ? await repos.users.findProfileById(a.co_supervisor_id)
                : null;

            const studentIds = [a.student_id, a.student2_id, a.student3_id].filter(Boolean) as string[];
            const profiles = await Promise.all(
                studentIds.map((sid) => repos.users.findProfileById(sid)),
            );
            const students = profiles
                .filter(Boolean)
                .map((p) => ({ id: p!.id, full_name: p!.full_name }));

            return {
                id: a.id,
                pfe_code: a.pfe_code ?? "—",
                subject_title: subject?.title ?? "Sujet inconnu",
                students,
                supervisor_name: supervisor?.full_name ?? "Inconnu",
                co_supervisor_name: coSupervisor?.full_name ?? null,
                status: a.status,
                status_label: PFE_STATUS_LABELS[a.status] ?? a.status,
                specialty: subject?.specialty ?? "—",
                memoire_url: a.memoire_url,
            };
        }),
    );

    return { assignments: enriched };
};