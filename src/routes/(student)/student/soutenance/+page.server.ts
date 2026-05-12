import { redirect } from "@sveltejs/kit";
import { createRepositories } from "$lib/server/repositories/factory";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user) redirect(302, "/accounts/login");

  const repos = createRepositories();
  const pfes = await repos.assignments.findByStudent(locals.user.id);
  const currentPfe = pfes.find((p) => p.status === "soutenance_planifiee" || p.status === "valide" || p.status === "refuse");

  if (!currentPfe) {
    return { defense: null };
  }

  const allDefenses = await repos.defenses.findAll();
  const defense = allDefenses.find((d) => d.assignment_id === currentPfe.id);

  if (!defense) {
    return { defense: null };
  }

  const grades = await repos.juryGrades.findByDefense(defense.id);

  return { defense, grades };
};
