import { redirect } from "@sveltejs/kit";
import { createRepositories } from "$lib/server/repositories/factory";
import type { PageServerLoad, Actions } from "./$types";

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user) redirect(302, "/accounts/login");

  const repos = createRepositories();
  const activeYear = await repos.academicYears.findActive();

  const [
    allSubjects,
    pendingSubjects,
    validatedSubjects,
    allCompanies,
    totalTeachers,
    totalStudents,
    totalDefenses,
    recentAuditLogs,
  ] = await Promise.all([
    repos.subjects.findByAcademicYear(activeYear?.id ?? ""),
    repos.subjects.findByStatus("en_attente"),
    repos.subjects.findByStatus("valide"),
    repos.users.findAllCompanies(),
    repos.users.findAllTeachers(),
    repos.users.findAllStudents(),
    repos.defenses.findAll(),
    repos.audit.findAll({}),
  ]);

  const pendingCompanies = allCompanies.filter((c) => !c.is_verified);

  return {
    stats: {
      totalSubjects: allSubjects.length,
      pendingSubjects: pendingSubjects.length,
      validatedSubjects: validatedSubjects.length,
      totalAssignments: 0,
      pendingCompanies: pendingCompanies.length,
      totalTeachers: totalTeachers.length,
      totalStudents: totalStudents.length,
      totalDefenses: totalDefenses.length,
    },
    activeYear: activeYear
      ? {
          ...activeYear,
          submission_open_at_formatted: formatDate(activeYear.submission_open_at),
          submission_close_at_formatted: formatDate(activeYear.submission_close_at),
        }
      : null,
    recentAuditLogs: recentAuditLogs.map((log) => ({
      ...log,
      created_at_formatted: formatDate(log.created_at),
    })),
  };
};

export const actions: Actions = {};
