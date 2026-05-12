import { redirect } from "@sveltejs/kit";
import { createRepositories } from "$lib/server/repositories/factory";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user) redirect(302, "/accounts/login");

  const repos = createRepositories();
  const specialities = await repos.specialities.findAll();

  return {
    specialities: specialities.map((s) => ({
      id: s.id,
      name: s.name,
      code: s.code,
      year_type: s.year_type,
    })),
  };
};
