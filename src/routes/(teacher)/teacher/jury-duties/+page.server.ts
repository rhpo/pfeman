import { redirect } from "@sveltejs/kit";
import { createRepositories } from "$lib/server/repositories/factory";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user) redirect(302, "/accounts/login");

  const repos = createRepositories();
  const allDefenses = await repos.defenses.findAll();
  const juryDuties = allDefenses.filter((d) => d.jury_id === locals.user!.id);

  const dutiesWithGrades = await Promise.all(
    juryDuties.map(async (d) => {
      const grades = await repos.juryGrades.findByDefense(d.id);
      return { defense: d, grades };
    }),
  );

  return { duties: dutiesWithGrades };
};
