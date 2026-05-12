import { redirect } from "@sveltejs/kit";
import { createRepositories } from "$lib/server/repositories/factory";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params, locals }) => {
  if (!locals.user) redirect(302, "/accounts/login");

  const repos = createRepositories();
  const pfe = await repos.assignments.findById(params.id);

  if (!pfe) {
    redirect(302, "/teacher/supervised-pfes");
  }

  const progressReports = await repos.progress.findByAssignment(params.id);

  // Check if supervisor evaluation already submitted
  const supervisorEval = await repos.supervisorEvaluations.findByEvaluator(
    locals.user.id,
    params.id,
  );

  return { pfe, progressReports, supervisorEval };
};
