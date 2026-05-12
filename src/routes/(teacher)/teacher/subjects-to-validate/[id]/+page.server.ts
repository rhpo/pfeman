import { redirect } from "@sveltejs/kit";
import { createRepositories } from "$lib/server/repositories/factory";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params, locals }) => {
  if (!locals.user) redirect(302, "/accounts/login");

  const repos = createRepositories();
  const subject = await repos.subjects.findById(params.id);

  if (!subject) {
    redirect(302, "/teacher/subjects-to-validate");
  }

  return { subject };
};
