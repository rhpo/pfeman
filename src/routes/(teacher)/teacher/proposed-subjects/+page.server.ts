import { redirect } from "@sveltejs/kit";
import { createRepositories } from "$lib/server/repositories/factory";
import type { PageServerLoad } from "./$types";

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user) redirect(302, "/accounts/login");

  const repos = createRepositories();
  const subjects = await repos.subjects.findByProposer(locals.user.id);

  const formatted = subjects.map((s) => ({
    id: s.id,
    title: s.title,
    description: s.description,
    group_type: s.group_type,
    specialty: s.specialty,
    status: s.status,
    created_at: formatDate(s.created_at),
  }));

  return { subjects: formatted };
};
