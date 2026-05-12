import { redirect, fail } from "@sveltejs/kit";
import { createRepositories } from "$lib/server/repositories/factory";
import type { PageServerLoad, Actions } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user) redirect(302, "/accounts/login");

  const repos = createRepositories();
  const notifications = await repos.notifications.findByRecipient(locals.user.id);

  return { notifications };
};

export const actions: Actions = {
  markRead: async ({ request, locals }) => {
    if (!locals.user) return fail(401, { error: "Non authentifie" });

    const data = Object.fromEntries(await request.formData());
    const repos = createRepositories();

    if (data.all === "true") {
      await repos.notifications.markAllRead(locals.user.id);
    } else if (data.id) {
      await repos.notifications.markRead(data.id as string);
    }

    return { success: true };
  },
};
