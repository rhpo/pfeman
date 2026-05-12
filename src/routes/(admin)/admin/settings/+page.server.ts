import { redirect } from "@sveltejs/kit";
import { createRepositories } from "$lib/server/repositories/factory";
import type { PageServerLoad } from "./$types";

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user) redirect(302, "/accounts/login");

  const repos = createRepositories();

  const [academicYears, specialities] = await Promise.all([
    repos.academicYears.findAll(),
    repos.specialities.findAll(),
  ]);

  // Get the active academic year for settings
  const activeYear = academicYears.find((y) => y.status === "active") ?? academicYears[0];

  const settings = activeYear
    ? {
      submission_open_at: activeYear.submission_open_at ?? "",
      submission_close_at: activeYear.submission_close_at ?? "",
      max_wishes: activeYear.max_wishes ?? 5,
    }
    : {
      submission_open_at: "",
      submission_close_at: "",
      max_wishes: 5,
    };

  const formattedYears = academicYears.map((y) => ({
    id: y.id,
    label: y.label,
    status: y.status,
    status_label: y.status === "active" ? "Active" : "Clôturée",
    submission_open_at: y.submission_open_at,
    submission_close_at: y.submission_close_at,
    submission_open_at_formatted: formatDate(y.submission_open_at),
    submission_close_at_formatted: formatDate(y.submission_close_at),
    max_wishes: y.max_wishes,
    created_at_formatted: formatDate(y.created_at),
  }));

  const formattedSpecialities = specialities.map((s) => ({
    id: s.id,
    name: s.name,
    code: s.code,
    year_type: s.year_type,
    year_type_label:
      s.year_type === "licence"
        ? "Licence"
        : s.year_type === "master"
          ? "Master"
          : "Ingenieur",
    created_at_formatted: formatDate(s.created_at),
  }));

  return {
    settings,
    academicYears: formattedYears,
    specialities: formattedSpecialities,
  };
};
