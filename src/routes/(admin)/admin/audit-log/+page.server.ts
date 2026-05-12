import { redirect } from "@sveltejs/kit";
import { createRepositories } from "$lib/server/repositories/factory";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals, url }) => {
  if (!locals.user) redirect(302, "/accounts/login");

  const repos = createRepositories();

  const actionTypeFilter = url.searchParams.get("action_type") || undefined;
  const actorFilter = url.searchParams.get("actor") || undefined;
  const dateFrom = url.searchParams.get("date_from") || undefined;
  const dateTo = url.searchParams.get("date_to") || undefined;
  const search = url.searchParams.get("search") || undefined;

  let logs = await repos.audit.findAll();

  if (actionTypeFilter) {
    logs = logs.filter((l) => l.action === actionTypeFilter);
  }
  if (actorFilter) {
    logs = logs.filter((l) => l.actor_id === actorFilter);
  }
  if (dateFrom) {
    logs = logs.filter((l) => l.created_at >= dateFrom);
  }
  if (dateTo) {
    logs = logs.filter((l) => l.created_at <= dateTo);
  }
  if (search) {
    const q = search.toLowerCase();
    logs = logs.filter((l) => l.entity.toLowerCase().includes(q));
  }

  return { logs, actionTypeFilter, actorFilter, dateFrom, dateTo, search };
};
