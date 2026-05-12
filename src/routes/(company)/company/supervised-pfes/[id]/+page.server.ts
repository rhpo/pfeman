import { redirect, fail } from "@sveltejs/kit";
import { createRepositories } from "$lib/server/repositories/factory";
import { logMeeting } from "$lib/server/use-cases/company/log-meeting";
import type { PageServerLoad, Actions } from "./$types";

export const load: PageServerLoad = async ({ params, locals }) => {
  if (!locals.user) redirect(302, "/accounts/login");

  const repos = createRepositories();
  const pfe = await repos.assignments.findById(params.id);

  if (!pfe) redirect(302, "/company/supervised-pfes");

  const [subject, progressReports, supervisorEval] = await Promise.all([
    repos.subjects.findById(pfe.subject_id),
    repos.progress.findByAssignment(pfe.id),
    repos.supervisorEvaluations.findByEvaluator(locals.user.id, pfe.id),
  ]);

  return { pfe: { ...pfe, subject }, progressReports, supervisorEval };
};

export const actions: Actions = {
  logMeeting: async ({ request, locals }) => {
    if (!locals.user) return fail(401, { error: "Non authentifie" });

    const data = Object.fromEntries(await request.formData());

    try {
      const repos = createRepositories();
      await logMeeting(repos, locals.user, {
        assignmentId: data.assignmentId as string,
        meetingDate: (data.meetingDate as string) || new Date().toISOString().split("T")[0],
        notes: (data.notes as string) || "",
      });

      return { success: true };
    } catch (err: any) {
      return fail(500, { error: err.message });
    }
  },
};
