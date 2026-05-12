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

  const [promotions, academicYears, specialities] = await Promise.all([
    repos.promotions.findAll(),
    repos.academicYears.findAll(),
    repos.specialities.findAll(),
  ]);

  const yearMap = new Map(academicYears.map((y) => [y.id, y.label]));

  const formattedPromotions = promotions.map((p) => ({
    id: p.id,
    label: p.label,
    specialty: p.specialty,
    academic_year_id: p.academic_year_id,
    academic_year_label: yearMap.get(p.academic_year_id) ?? "—",
    created_at_formatted: formatDate(p.created_at),
  }));

  const formattedYears = academicYears.map((y) => ({
    id: y.id,
    label: y.label,
  }));

  return {
    promotions: formattedPromotions,
    academicYears: formattedYears,
    specialities: specialities.map((s) => ({
      id: s.id,
      name: s.name,
      code: s.code,
      year_type: s.year_type,
    })),
  };
};
