import { redirect, fail } from "@sveltejs/kit";
import { createRepositories } from "$lib/server/repositories/factory";
import { submitWish } from "$lib/server/use-cases/student/submit-wish";
import type { PageServerLoad, Actions } from "./$types";

export const load: PageServerLoad = async ({ params, locals }) => {
  if (!locals.user) redirect(302, "/accounts/login");

  const repos = createRepositories();
  const subject = await repos.subjects.findById(params.id);

  if (!subject) {
    redirect(302, "/student/catalogue");
  }

  const activeYear = await repos.academicYears.findActive();
  const yearId = activeYear?.id ?? "";

  const [wishes, pfes] = await Promise.all([
    repos.wishes.findByStudent(locals.user.id, yearId),
    repos.assignments.findByStudent(locals.user.id),
  ]);

  const alreadyWished = wishes.some((w) => w.subject_id === params.id);
  const alreadyAssigned = pfes.some((p) => p.status === "en_cours" || p.status === "soutenance_planifiee");

  return { subject, alreadyWished, alreadyAssigned, wishesCount: wishes.length };
};

export const actions: Actions = {
  addWish: async ({ params, locals }) => {
    if (!locals.user) return fail(401, { error: "Non authentifie" });

    try {
      const repos = createRepositories();
      await submitWish(repos, locals.user, params.id);
      return { success: true };
    } catch (err: any) {
      return fail(500, { error: err.message });
    }
  },
};
