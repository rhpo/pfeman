import { redirect, fail } from "@sveltejs/kit";
import { createRepositories } from "$lib/server/repositories/factory";
import { assignStudent } from "$lib/server/use-cases/company/assign-student";
import type { PageServerLoad, Actions } from "./$types";

export const load: PageServerLoad = async ({ params, locals }) => {
  if (!locals.user) redirect(302, "/accounts/login");

  const repos = createRepositories();
  const subject = await repos.subjects.findById(params.id);

  if (!subject) redirect(302, "/company/my-subjects");

  const wishes = await repos.wishes.findBySubject(params.id);

  return { subject, wishes };
};

export const actions: Actions = {
  assign: async ({ request, locals }) => {
    if (!locals.user) return fail(401, { error: "Non authentifie" });

    const data = Object.fromEntries(await request.formData());
    const studentIds = ((data.studentIds as string) || "").split(",").filter(Boolean);

    try {
      const repos = createRepositories();
      await assignStudent(repos, locals.user, {
        subjectId: data.subjectId as string,
        studentIds,
      });

      return { success: true };
    } catch (err: any) {
      return fail(500, { error: err.message });
    }
  },
};
