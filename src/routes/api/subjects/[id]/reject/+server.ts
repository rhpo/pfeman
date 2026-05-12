import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { requireRole } from "$lib/server/guards/require-role";
import { validateSubject } from "$lib/server/use-cases/admin/validate-subject";
import { z } from "zod/v4";
const rejectSchema = z.object({
  reason: z.string().min(5, "Rejection reason is required").max(1000),
});

export const PATCH: RequestHandler = async ({ params, request, locals }) => {
  try {
    const user = requireRole(locals.user, "admin");
    const body = await request.json();
    const result = rejectSchema.safeParse(body);

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

    const subject = await validateSubject(locals.db, user, params.id, {
      status: "refuse",
      reason: result.data.reason,
    });
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
