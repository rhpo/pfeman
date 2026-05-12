import { redirect } from "@sveltejs/kit";
import { createRepositories } from "$lib/server/repositories/factory";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params, locals }) => {
  if (!locals.user) redirect(302, "/accounts/login");

  const repos = createRepositories();
  const subject = await repos.subjects.findById(params.id);

  if (!subject) {
    redirect(302, "/teacher/proposed-subjects");
  }

  const wishes = await repos.wishes.findBySubject(params.id);
  const studentIds = wishes.map((w) => w.student_id);

  // Load student records + their profiles to get names
  const students = (
    await Promise.all(
      studentIds.map(async (sid) => {
        const student = await repos.users.findStudentByProfileId(sid);
        if (!student) return null;
        const profile = await repos.users.findProfileById(sid);
        return {
          id: sid,
          first_name: profile?.full_name?.split(" ").slice(0, -1).join(" ") ?? "",
          last_name: profile?.full_name?.split(" ").pop() ?? "",
          specialty: student.specialty ?? "",
        };
      }),
    )
  ).filter((s): s is NonNullable<typeof s> => s !== null);

  return { subject, wishes, students };
};
