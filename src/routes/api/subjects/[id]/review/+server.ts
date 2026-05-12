import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { requireRole } from "$lib/server/guards/require-role";
import { reviewSubjectSchema } from "$lib/server/validators/subject.schema";
import { reviewSubject } from "$lib/server/use-cases/teacher/review-subject";
export const PATCH: RequestHandler = async ({ params, request, locals }) => {
  try {
    const user = requireRole(locals.user, "teacher");
    const body = await request.json();
    const result = reviewSubjectSchema.safeParse(body);

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

    const subject = await reviewSubject(
      locals.db,
      user,
      params.id,
      result.data,
    );
    return json(subject);
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
