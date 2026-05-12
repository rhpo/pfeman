import { redirect } from "@sveltejs/kit";
import { createRepositories } from "$lib/server/repositories/factory";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user) redirect(302, "/accounts/login");

  const repos = createRepositories();
  const activeYear = await repos.academicYears.findActive();
  if (!activeYear) return { subjects: [] };

  const student = await repos.users.findStudentByProfileId(locals.user.id);
  if (!student) redirect(302, "/accounts/login");

  const subjects = await repos.subjects.findValidatedBySpecialty(student.specialty ?? "", activeYear.id);

  return { subjects };
};
