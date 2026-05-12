import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { requireRole } from "$lib/server/guards/require-role";
import { createSubjectSchema } from "$lib/server/validators/subject.schema";
import { submitSubject } from "$lib/server/use-cases/student/submit-subject";
import { proposeSubject } from "$lib/server/use-cases/company/propose-subject";
export const POST: RequestHandler = async ({ request, locals }) => {
  try {
    const user = requireRole(
      locals.user,
      "student",
      "teacher",
      "company",
    );
    const body = await request.json();
    const result = createSubjectSchema.safeParse(body);

    if (!result.success) {
      const fields = Object.fromEntries(
        result.error.issues.map((i) => [String(i.path[0]), i.message]),
      );
      return json(
        {
          error: { code: "VALIDATION_ERROR", message: "Invalid input", fields },
        },
        { status: 400 },
      );
    }

    const subject =
      user.role === "company"
        ? await proposeSubject(locals.db, user, result.data)
        : await submitSubject(locals.db, user, result.data);

    return json(subject, { status: 201 });
  } catch (err: unknown) {
    const e = err as { status?: number; message?: string };
    if (e?.status)
      return json(
        { error: { code: "FORBIDDEN", message: e.message ?? "Forbidden" } },
        { status: e.status },
      );
    return json(
      { error: { code: "INTERNAL", message: "Unexpected error" } },
      { status: 500 },
    );
  }
};

export const GET: RequestHandler = async ({ url, locals }) => {
  try {
    const user = requireRole(
      locals.user,
      "student",
      "teacher",
      "admin",
      "company",
    );
    const subjects = await locals.db.subjects.findByProposer(user.id);
    return json(subjects);
  } catch (err: unknown) {
    const e = err as { status?: number; message?: string };
    if (e?.status)
      return json(
        { error: { code: "FORBIDDEN", message: e.message ?? "Forbidden" } },
        { status: e.status },
      );
    return json(
      { error: { code: "INTERNAL", message: "Unexpected error" } },
      { status: 500 },
    );
  }
};
