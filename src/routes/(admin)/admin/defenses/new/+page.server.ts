import { redirect } from "@sveltejs/kit";
import { createRepositories } from "$lib/server/repositories/factory";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals, url }) => {
  if (!locals.user) redirect(302, "/accounts/login");

  const repos = createRepositories();

  const activeYear = await repos.academicYears.findActive();
  const yearId = activeYear?.id ?? "";

  const preSelectedId = url.searchParams.get("assignment_id") || undefined;

  const [pfes, subjects, studentProfiles] = await Promise.all([
    repos.assignments.findByAcademicYear(yearId),
    repos.subjects.findByAcademicYear(yearId),
    repos.users.findProfilesByRole("student"),
  ]);

  // Build a map of subject id -> title
  const subjectMap = new Map(subjects.map((s) => [s.id, s.title]));
  // Build a map of student profile id -> full_name
  const studentMap = new Map(studentProfiles.map((p) => [p.id, p.full_name]));

  // Format PFE options with subject title and student name
  const pfeOptions = pfes.map((pfe) => {
    const subjectTitle = subjectMap.get(pfe.subject_id) ?? "Sujet inconnu";
    const studentName = studentMap.get(pfe.student_id) ?? "Etudiant inconnu";
    return {
      id: pfe.id,
      label: `${subjectTitle} — ${studentName}`,
    };
  });

  return {
    pfeOptions,
    preSelectedId,
  };
};
