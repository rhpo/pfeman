import { redirect } from "@sveltejs/kit";
import { createRepositories } from "$lib/server/repositories/factory";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user) redirect(302, "/accounts/login");

  const repos = createRepositories();
  const [subjects, pfes, notifications] = await Promise.all([
    repos.subjects.findByProposer(locals.user.id),
    repos.assignments.findBySupervisor(locals.user.id),
    repos.notifications.findByRecipient(locals.user.id),
  ]);

  return { subjects, pfes, notifications };
};
