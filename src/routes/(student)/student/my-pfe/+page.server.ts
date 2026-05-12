import { redirect, fail } from "@sveltejs/kit";
import { createRepositories } from "$lib/server/repositories/factory";
import { logMeeting } from "$lib/server/use-cases/student/log-meeting";
import type { PageServerLoad, Actions } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user) redirect(302, "/accounts/login");

  const repos = createRepositories();
  const pfes = await repos.assignments.findByStudent(locals.user.id);
  const currentPfe = pfes.find((p) => p.status === "en_cours" || p.status === "soutenance_planifiee");

  if (!currentPfe) {
    return { pfe: null, progressReports: [] };
  }

  const [subject, progressReports] = await Promise.all([
    repos.subjects.findById(currentPfe.subject_id),
    repos.progress.findByAssignment(currentPfe.id),
  ]);

  return { pfe: { ...currentPfe, subject }, progressReports };
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
