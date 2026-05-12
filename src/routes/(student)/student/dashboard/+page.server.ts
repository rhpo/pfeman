import { redirect } from "@sveltejs/kit";
import { createRepositories } from "$lib/server/repositories/factory";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user) redirect(302, "/accounts/login");

  const repos = createRepositories();
  const activeYear = await repos.academicYears.findActive();
  const yearId = activeYear?.id ?? "";

  const [pfes, wishes, notifications] = await Promise.all([
    repos.assignments.findByStudent(locals.user.id),
    repos.wishes.findByStudent(locals.user.id, yearId),
    repos.notifications.findByRecipient(locals.user.id),
  ]);

  const currentPfe = pfes.find((p) => p.status === "en_cours" || p.status === "soutenance_planifiee");

  return {
    currentPfe,
    wishes,
    notifications,
    yearId,
  };
};
