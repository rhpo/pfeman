import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { requireRole } from "$lib/server/guards/require-role";
export const GET: RequestHandler = async ({ params, locals }) => {
  try {
    requireRole(
      locals.user,
      "student",
      "teacher",
      "admin",
      "company",
    );
    const subject = await locals.db.subjects.findById(params.id);
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
