import { redirect, fail } from "@sveltejs/kit";
import { createRepositories } from "$lib/server/repositories/factory";
import { proposeSubject } from "$lib/server/use-cases/company/propose-subject";
import type { PageServerLoad, Actions } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user) redirect(302, "/accounts/login");

  const repos = createRepositories();
  const specialities = await repos.specialities.findAll();

  return {
    specialities: specialities.map((s) => ({
      id: s.id,
      name: s.name,
      code: s.code,
      year_type: s.year_type,
    })),
  };
};

export const actions: Actions = {
  default: async ({ request, locals }) => {
    if (!locals.user) return fail(401, { error: "Non authentifie" });

    const data = Object.fromEntries(await request.formData());

    try {
      const repos = createRepositories();
      await proposeSubject(repos, locals.user, {
        title: data.title as string,
        description: data.description as string,
        type: "external",
        specialty: data.specialty as string,
        level: (data.level as "licence" | "master" | "ingenieur") ?? "master",
      });

      return { success: true };
    } catch (err: any) {
      return fail(500, { error: err.message });
    }
  },
};
