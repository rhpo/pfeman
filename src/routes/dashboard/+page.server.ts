import type { PageServerLoad } from "./$types";

import { redirect } from "@sveltejs/kit";
import { DASHBOARD_ROLE_PATHS } from "$lib/server/repositories/port";

export const load: PageServerLoad = async ({ locals }) => {
  const { user } = locals;

  if (user) {
    throw redirect(302, DASHBOARD_ROLE_PATHS[user.role]);
  } else {
    throw redirect(302, "/accounts/login");
  }
};
