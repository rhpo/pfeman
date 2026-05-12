import { redirect, fail } from "@sveltejs/kit";
import { createRepositories } from "$lib/server/repositories/factory";
import { removeWish } from "$lib/server/use-cases/student/remove-wish";
import type { PageServerLoad, Actions } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user) redirect(302, "/accounts/login");

  const repos = createRepositories();
  const activeYear = await repos.academicYears.findActive();
  const yearId = activeYear?.id ?? "";

  const wishes = await repos.wishes.findByStudent(locals.user.id, yearId);

  return { wishes, maxWishes: activeYear?.max_wishes ?? 5 };
};

export const actions: Actions = {
  remove: async ({ request, locals }) => {
    if (!locals.user) return fail(401, { error: "Non authentifie" });

    const data = Object.fromEntries(await request.formData());

    try {
      const repos = createRepositories();
      await removeWish(repos, locals.user, data.wishId as string);
      return { success: true };
    } catch (err: any) {
      return fail(500, { error: err.message });
    }
  },
};
