import { redirect } from "@sveltejs/kit";
import { createRepositories } from "$lib/server/repositories/factory";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user) redirect(302, "/accounts/login");

  const repos = createRepositories();
  const academicYears = await repos.academicYears.findAll();

  return { academicYears };
};
