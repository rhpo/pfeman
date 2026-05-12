import { redirect } from "@sveltejs/kit";
import { createRepositories } from "$lib/server/repositories/factory";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals, url }) => {
  if (!locals.user) redirect(302, "/accounts/login");

  const repos = createRepositories();

  const yearFilter = url.searchParams.get("academic_year_id") || undefined;

  const [academicYears, teachers, students, companies, subjects, pfes, defenses] = await Promise.all([
    repos.academicYears.findAll(),
    repos.users.findAllTeachers(),
    repos.users.findAllStudents(),
    repos.users.findAllCompanies(),
    repos.subjects.findByAcademicYear(yearFilter ?? ""),
    repos.assignments.findByAcademicYear(yearFilter ?? ""),
    repos.defenses.findAll(),
  ]);

  // Compute all derived counts server-side
  const totalPfes = pfes.length;
  const totalTeachers = teachers.length;
  const totalStudents = students.length;
  const totalCompanies = companies.length;
  const totalDefenses = defenses.length;

  const validatedSubjects = subjects.filter((s) => s.status === "valide").length;
  const pendingSubjects = subjects.filter((s) => s.status === "en_attente").length;
  const refusedSubjects = subjects.filter((s) => s.status === "refuse").length;

  const activePfes = pfes.filter((p) => p.status === "en_cours").length;
  const defendedPfes = pfes.filter(
    (p) => p.status === "soutenance_planifiee" || p.status === "valide"
  ).length;

  const scheduledDefenses = defenses.filter((d) => d.status === "scheduled").length;
  const doneDefenses = defenses.filter((d) => d.status === "done").length;

  return {
    academicYears,
    yearFilter,
    totalPfes,
    totalTeachers,
    totalStudents,
    totalCompanies,
    totalDefenses,
    validatedSubjects,
    pendingSubjects,
    refusedSubjects,
    activePfes,
    defendedPfes,
    scheduledDefenses,
    doneDefenses,
  };
};
