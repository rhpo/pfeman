import { redirect, fail } from "@sveltejs/kit";
import { createRepositories } from "$lib/server/repositories/factory";
import { setAvailability } from "$lib/server/use-cases/teacher/set-availability";
import type { PageServerLoad, Actions } from "./$types";
import type { AvailabilityStatus } from "$lib/server/repositories/port";

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user) redirect(302, "/accounts/login");

  const repos = createRepositories();
  const rawTeacher = await repos.users.findTeacherByProfileId(locals.user.id);

  const teacher = {
    ...rawTeacher,
    availability_status: rawTeacher?.availability_status ?? "disponible",
    unavailable_until: rawTeacher?.unavailable_until ?? "",
  };

  return { teacher };
};

export const actions: Actions = {
  default: async ({ request, locals }) => {
    if (!locals.user) return fail(401, { error: "Non authentifie" });

    const data = Object.fromEntries(await request.formData());

    try {
      const repos = createRepositories();
      await setAvailability(repos, locals.user, {
        status: data.status as AvailabilityStatus,
        unavailableUntil: (data.unavailable_until as string) || null,
      });

      return { success: true };
    } catch (err: any) {
      return fail(500, { error: err.message });
    }
  },
};
