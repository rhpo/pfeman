import { redirect } from "@sveltejs/kit";
import { createRepositories } from "$lib/server/repositories/factory";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals, url }) => {
  if (!locals.user) redirect(302, "/accounts/login");

  const repos = createRepositories();

  const dateFilter = url.searchParams.get("date") || undefined;
  const statusFilter = url.searchParams.get("status") || undefined;

  let defenses = await repos.defenses.findAll();

  if (dateFilter) {
    defenses = defenses.filter((d) => d.scheduled_at.startsWith(dateFilter));
  }
  if (statusFilter) {
    defenses = defenses.filter((d) => d.status === statusFilter);
  }

  return { defenses, dateFilter, statusFilter };
};
